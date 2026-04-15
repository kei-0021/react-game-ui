// src/server/logic/toke-manager.ts
import { BoardId, CellId, PlayerId, TokenId, TokenStoreId } from '@/types/definition.js';
import { GameParam } from '@/types/gameParam.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/roomState.js';
import { server_log } from '../log/logger.js';
import { RoomManager } from '../room-manager.js';

export class TokenManager {
  constructor(
    private param: GameParam,
    private state: RoomState,
  ) {}

  /**
   * トークンを取得する
   * @param tokenStoreId - トークン置き場ID
   * @param tokenId - トークンID。null ならランダムでトークンを置き場から選ぶ
   * @param playerId - プレイヤーID
   */
  acquireToken(tokenStoreId: TokenStoreId, tokenId: TokenId | null = null, playerId: PlayerId) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;
    const tokens = this.state.tokenStores[tokenStoreId];
    if (tokens.length === 0) return;

    // tokenId が指定されていればそのインデックス、null ならランダムなインデックスを選択
    const index =
      tokenId !== null ? tokens.findIndex((t) => t.id === tokenId) : Math.floor(Math.random() * tokens.length);

    if (index !== -1) {
      const acquiredToken = tokens.splice(index, 1)[0];
      if (!Array.isArray(player.tokens)) {
        player.tokens = [];
      }
      player.tokens.push(acquiredToken);

      server_log(
        'token',
        this.state.gameId,
        this.state.roomId,
        `${player.name} (${playerId}) がストア ${tokenStoreId} からトークン ${acquiredToken.id} を獲得しました。`,
      );
    }
  }

  // 盤面 → 盤面
  MoveOnBoardToken(boardId: BoardId, tokenId: TokenId, newLocation: Position, roomManager: RoomManager): void {
    const token = this.state.boardTokens[boardId].find((t) => t.id == tokenId);
    if (!token) return;

    // 座標を更新
    const oldLocation = token.position;
    if (!oldLocation) return;
    token.position = newLocation;

    // セル効果
    const cellEffects = this.param.cellEffects;
    if (cellEffects && token.ownerId) {
      roomManager.applyCellEffect(boardId, token.ownerId, newLocation, cellEffects);
    }

    // カスタムフック
    const onTokenMove = this.param.onTokenMove;
    if (onTokenMove) {
      onTokenMove(this.state, roomManager, newLocation);
    }

    server_log(
      'token',
      this.state.gameId,
      this.state.roomId,
      `MOVEON: ${token.name} (ID:${token.id}) (${oldLocation.row}, ${oldLocation.col}-> ${newLocation.row}, ${newLocation.col})`,
    );
  }

  // 盤面 → 手持ち
  MoveFromBoardToken(boardId: BoardId, tokenId: TokenId, socketId: string): void {
    const player = this.state.players.find((p) => p.socketId === socketId);

    // 盤面の配列から対象のトークンを探す
    const boardTokens = this.state.boardTokens[boardId];
    if (!boardTokens || !player) return;

    const index = boardTokens.findIndex((t) => t.id === tokenId);
    if (index === -1) return;

    // 配列から取り出す
    const [token] = boardTokens.splice(index, 1);

    // 属性を書き換える
    token.ownerId = player.id;
    token.position = null;
    token.movableCells = [];

    // プレイヤーの手持ちに追加
    if (!Array.isArray(player.tokens)) {
      player.tokens = [];
    }
    player.tokens.push(token);

    server_log(
      'token',
      this.state.gameId,
      this.state.roomId,
      `MOVEFROM: ${token.name} (ID:${token.id}) (${boardId} -> ${player.id})`,
    );
  }

  /**
   * 手持ちから盤面へトークンを移動する
   */
  playToken(boardId: BoardId, tokenId: TokenId, playerId: PlayerId, newLocation: Position): void {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    // 先に対象のトークンを確保する
    const targetToken = player.tokens.find((t) => t.id === tokenId);
    if (!targetToken) return;

    // プレイヤーのリストから除外
    player.tokens = player.tokens.filter((t) => t.id !== tokenId);

    // 盤面に移動（Recordに追加）
    this.state.boardTokens[boardId].push({
      ...targetToken,
      position: newLocation,
    });

    server_log(
      'token',
      this.state.gameId,
      this.state.roomId,
      `PLAY: ${targetToken.name} (ID:${targetToken.id}) (${playerId} -> ${boardId} ${newLocation.row}, ${newLocation.col})`,
    );
  }

  /**
   * 指定したセルから一定歩数で行けるセルIDをすべて取得する
   * isExact: true の場合、moveRange と同じ歩数のセルのみを返す
   */
  getMovableCellIds = (boardId: BoardId, startCellId: CellId, moveRange: number, isExact: boolean): CellId[] => {
    const targetBoard = this.state.boards[boardId];
    const boardMap = new Map(targetBoard.map((c) => [c.id, c]));

    const reachable = new Set<string>();
    const queue: { id: string; dist: number }[] = [{ id: startCellId, dist: 0 }];
    const visited = new Set<string>([startCellId]);

    while (queue.length > 0) {
      const { id, dist } = queue.shift()!;

      // 登録条件の判定
      if (dist > 0) {
        if (isExact) {
          // isExactフラグがtrueなら、指定歩数と同じ場合のみ登録
          if (dist === moveRange) reachable.add(id);
        } else {
          // 通常時は今まで通り移動範囲内すべて
          reachable.add(id);
        }
      }

      // 探索継続の判定（移動範囲を超えたら隣接は探さない）
      if (dist >= moveRange) continue;

      const cell = boardMap.get(id);
      cell?.adjacentCellIds.forEach((nextId) => {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push({ id: nextId, dist: dist + 1 });
        }
      });
    }
    return Array.from(reachable);
  };
}
