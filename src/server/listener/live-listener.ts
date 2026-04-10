// src/server/listener/editor-listner.ts

import { GameId, GameParam } from '@/index.js';
import { GameCreateData, GameDeleteData, GameParamUpdateData } from '@/types/socketData.js';
import { exec } from 'child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Socket } from 'socket.io';
import util from 'util';
import { server_log } from '../log/logger.js';
import { deepMerge } from '../logic/utils.js';

const execPromise = util.promisify(exec);

/**
 * エディタ専用のイベントリスナーをSocketインスタンスに登録する。
 * プラットフォームの「メタ操作（構築・管理）」を担当し、
 * ゲームの新規作成、削除、およびパラメータの動的更新（Data.tsの書き換え等）などの
 * 破壊的・創造的な操作をSocket通信経由で実行可能にする。
 * @param {Socket} socket - 接続されたクライアントのSocket.IOインスタンス
 * @param {Record<GameId, GameParam>} gameParams - サーバーが保持しているゲーム定義データの参照
 */
export function registerLiveListeners(socket: Socket, gameParams: Record<GameId, GameParam>) {
  // GUIからConfigファイルを直接書き換える
  socket.on('game-param:update', async (data: GameParamUpdateData) => {
    try {
      // ベースとなるルートディレクトリを確定させる
      const root = process.cwd();

      // src が存在するかチェックして、書き込み先ディレクトリを決定する
      const getTargetDir = () => {
        const srcPath = path.join(root, 'src', 'server');
        const testsPath = path.join(root, 'tests', 'server');

        // tests/server が存在すればそこを優先
        return fs.existsSync(testsPath) ? testsPath : srcPath;
      };

      const targetDir = getTargetDir();
      const targetPath = path.join(targetDir, `${data.gameId}Data.ts`);

      // 現在のメモリ上の設定を取得
      const currentParam = gameParams[data.gameId] || {};

      // components 内の各要素にスロット属性（slotX, slotY等）を「後付け」で確定させる
      const processedComponents = data.newParam.components?.map((comp: any) => ({
        ...comp,
        props: {
          ...comp.props,
          slotX: comp.props?.slotX,
          slotY: comp.props?.slotY,
          cols: comp.props?.cols,
          gap: comp.props?.gap,
          padding: comp.props?.padding,
        },
      }));

      // マージ処理
      const mergedParam = {
        ...deepMerge({ ...currentParam }, data.newParam),
        // 以下のプロパティは、部分的なマージではなく「最新の状態」で完全に上書きする
        ...(data.newParam.initialDecks ? { initialDecks: data.newParam.initialDecks } : {}),
        ...(data.newParam.draggables ? { draggables: data.newParam.draggables } : {}),
        ...(processedComponents ? { components: processedComponents } : {}),
      };

      // 不要な一時的プロパティを削除してクリーンなデータにする
      delete mergedParam.cardEffects;
      delete mergedParam.cellEffects;
      delete mergedParam.shuffleAndReconnectBoard;
      delete mergedParam.initialBoard;

      const setupContent = JSON.stringify(mergedParam, null, 2);

      const pascalName = data.gameId.charAt(0).toUpperCase() + data.gameId.slice(1);
      const content = `export const ${pascalName}Data: any = ${setupContent};`;

      await fs.promises.writeFile(targetPath, content, 'utf8');

      // メモリ上のデータも更新（即時反映のため）
      gameParams[data.gameId] = mergedParam;

      socket.emit('game-param:updated', { success: true });
    } catch (err) {
      console.error('[Admin] 書き換え失敗:', err);
      socket.emit('error', 'ファイルの保存に失敗');
    }
  });

  socket.on('game:create', async (data: GameCreateData) => {
    try {
      const { gameName, gameIcon } = data;

      // プロジェクトルートにある CLI を実行
      const cliPath = path.resolve(process.cwd(), 'src/cli/generate-new-game.ts');
      const command = `npx tsx ${cliPath} ${gameName} ${gameIcon}`;

      server_log('game', gameName, null, `CLI実行中": ${command}`);

      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        console.warn(`[Admin] CLI警告: ${stderr}`);
      }

      server_log('game', gameName, null, `CLI完了: ${stdout}`);

      socket.emit('game:created', {
        success: true,
        gameId: gameName.toLowerCase(),
      });
    } catch (err: any) {
      console.error(`[Admin] CLIエラー: ${err.message}`);
      socket.emit('error', 'ゲーム生成に失敗しました');
    }
  });

  socket.on('game:delete', async (data: GameDeleteData) => {
    try {
      const { gameId } = data;

      const cliPath = path.resolve(process.cwd(), 'src/cli/delete-game.ts');
      const command = `npx tsx ${cliPath} ${gameId}`;

      server_log('game', gameId, null, `削除CLI実行中: ${command}`);

      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        console.warn(`[Admin] 削除CLI警告: ${stderr}`);
      }

      server_log('game', gameId, null, `削除CLI完了: ${stdout}`);

      // フロントに完了を通知
      socket.emit('game:deleted', {
        success: true,
        gameId: gameId,
      });
    } catch (err: any) {
      console.error(`[Admin] 削除CLIエラー: ${err.message}`);
      socket.emit('error', 'ゲームの削除に失敗しました');
    }
  });
}
