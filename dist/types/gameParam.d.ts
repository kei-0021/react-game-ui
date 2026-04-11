import type { RoomManager } from '@/server/room-manager.js';
import type { CellData } from './cell.js';
import type { ComponentInfo } from './component.js';
import type { DeckData } from './deck.js';
import type { BoardId, DeckId, DraggableId, GameId, PieceId, PlayerId, TokenId } from './definition.js';
import type { DraggableData } from './draggable.js';
import type { Instruction } from './instruction.js';
import type { Phase } from './phase.js';
import { PieceData } from './piece.js';
import type { Resource } from './resource.js';
import type { RoomState } from './roomState.js';
import type { CardPlayData, DeckDrawData } from './socketData.js';
import type { TokenStoreData } from './tokenStore.js';
/**
 * ゲームルーム作成時の初期設定パラメータ。
 * @param gameId - ゲームを一意に識別するID。
 * @param gameIcon - ロビーで表示するゲームのアイコン。
 * @param maxPlayers - 最大プレイヤー数（任意）。
 * @param initialDecks - デッキの初期構成リスト。
 * @param initialHand - デッキごとの初期手札の枚数設定。
 * @param initialResources - プレイヤーの初期リソース。
 * @param initialTokenStores - 共有トークンの保管場所。
 * @param initialTokens - トークンごとの初期配布個数設定。
 * @param initialBoard - ボードの初期レイアウト。
 * @param shuffleAndReconnectBoard - シャッフルと再接続を利用するボードとその戦略関数。
 * @param pieceImage - ボード上のプレイヤーコマに使用する画像URL。
 * @param extraPieces - ボード上のプレイヤー以外のコマに使用するデータ。
 * @param draggable - ドラッグ可能オブジェクト。
 * @param initialPhase - 初期フェーズ。
 * @param cardEffects - カードの特殊効果定義。
 * @param cellEffects - セルの特殊効果定義。
 * @param onDeckDraw - デッキからカードを引いた時のカスタムフック。
 * @param onCardPlay - カードプレイ時のカスタムフック。
 * @param onAllPlayersCardHold - 全てのプレイヤーがホールドした時のカスタムフック。
 * @param onPieceMove - 駒を動かした時のカスタムフック。
 * @param onNextRound - 次のラウンドへ進んだ時のカスタムフック。
 * @param checkGameEnd - 終了判定ロジック。
 * @param onGameEnd - リザルト生成ロジック。
 * @param components - クライアントサイドで表示するコンポーンネント一覧。
 */
export type GameParam = {
    gameId: GameId;
    gameIcon: string;
    maxPlayers?: number;
    initialDecks?: DeckData[];
    initialHand?: Record<DeckId, number>;
    initialResources?: Resource[];
    initialTokenStores?: TokenStoreData[];
    initialTokens?: Record<TokenId, number>;
    initialBoard?: Record<BoardId, CellData[]>;
    shuffleAndReconnectBoard?: Record<BoardId, (cells: CellData[]) => CellData[]>;
    pieceImage?: string;
    extraPieces?: Record<PieceId, PieceData>;
    draggables?: Record<DraggableId, DraggableData>;
    initialPhase?: Phase;
    cardEffects?: Record<string, any>;
    cellEffects?: Record<string, (manager: RoomManager, player: PlayerId) => void>;
    onDeckDraw?: (state: RoomState, manager: RoomManager, data: DeckDrawData) => void;
    onCardPlay?: ((state: RoomState, manager: RoomManager, data: CardPlayData) => void | Instruction[]) | Instruction[];
    onAllPlayersCardHold?: (state: RoomState, manager: RoomManager) => void;
    onPieceMove?: (state: RoomState, manager: RoomManager, newLocation: any) => void;
    onNextRound?: (state: RoomState, manager: RoomManager) => void;
    checkGameEnd?: (state: RoomState) => void;
    onGameEnd?: (state: RoomState) => any;
    components: ComponentInfo[];
};
//# sourceMappingURL=gameParam.d.ts.map