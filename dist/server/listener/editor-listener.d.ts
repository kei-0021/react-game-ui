import { GameId, GameParam } from '@/index.js';
import { Socket } from 'socket.io';
/**
 * エディタ専用のイベントリスナーをSocketインスタンスに登録する。
 * プラットフォームの「メタ操作（構築・管理）」を担当し、
 * ゲームの新規作成、削除、およびパラメータの動的更新（Data.tsの書き換え等）などの
 * 破壊的・創造的な操作をSocket通信経由で実行可能にする。
 * @param {Socket} socket - 接続されたクライアントのSocket.IOインスタンス
 * @param {Record<GameId, GameParam>} gameParams - サーバーが保持しているゲーム定義データの参照
 */
export declare function registerEditorListeners(socket: Socket, gameParams: Record<GameId, GameParam>): void;
//# sourceMappingURL=editor-listener.d.ts.map