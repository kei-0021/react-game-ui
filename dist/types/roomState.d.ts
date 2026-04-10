import type { CardData } from './card.js';
import type { CellData } from './cell.js';
import type { BoardId, CardId, DeckId, DraggableId, GameId, PlayerId, RoomId, TokenStoreId } from './definition.js';
import type { DraggableData } from './draggable.js';
import type { Phase } from './phase.js';
import type { Player } from './player.js';
import type { Position } from './position.js';
import type { TokenData } from './token.js';
/**
 * 実行中のゲームルームの動的な状態を管理する。
 * @param gameId - 適用されているゲーム設定の識別ID。
 * @param roomId - ルームを一意に識別するID。
 * @param createdAt - ルームが作成されたタイムスタンプ。
 * @param currentRoundIndex - 現在のラウンド数（0開始）。
 * @param currentTurnIndex - 現在のターン数（0開始）。
 * @param currentPhase - 現在の進行フェーズ。
 * @param players - 参加しているプレイヤーのリスト。
 * @param decks - 各デッキIDごとの残りカードリスト。
 * @param playFieldCards - プレイフィールド上のカード（キーは "firework" 等の場所名）。
 * @param discardPile - 捨て札置き場のカードリスト。
 * @param boards - ボード上のセルデータ。
 * @param exploredCells - すでに探索・公開されたセルの座標リスト。
 * @param tokenStores - 共有トークンの現在のストック状況。
 * @param draggable - ドラッグ可能オブジェクト。
 * @param timer - タイマー。
 * @param maxZIndex - フィールド上の全オブジェクト（カード、ピース等）で共有する 重ね順のグローバル・カウンタ
 * @param systemMessageHistory - 過去のシステムメッセージの履歴。
 */
export type RoomState = {
    gameId: GameId;
    roomId: RoomId;
    createdAt: number;
    currentRoundIndex: number;
    currentTurnIndex: number;
    currentPhase?: Phase;
    players: Player[];
    decks: Record<DeckId, CardData[]>;
    playFieldCards: Record<DeckId, CardData[]>;
    discardPile: Record<PlayerId, CardData[]>;
    holdCards: Record<PlayerId, Record<DeckId, CardId[]>>;
    boards: Record<BoardId, CellData[]>;
    exploredCells: Position[];
    tokenStores: Record<TokenStoreId, TokenData[]>;
    draggables: Record<DraggableId, DraggableData>;
    timer: NodeJS.Timeout;
    maxZIndex: number;
    systemMessageHistory: string[];
};
//# sourceMappingURL=roomState.d.ts.map