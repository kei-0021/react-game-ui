// src/types/server.ts
import { CellData, Player } from '@/index.js';
import { RoomManager } from '@/server/server-utils.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { BoardId, CardId, DeckId, DraggableId, GameId, PlayerId, RoomId, TokenId, TokenStoreId } from './definition.js';
import { DraggableData } from './draggable.js';
import { Phase } from './phase.js';
import { Position } from './position.js';
import { Resource } from './resource.js';
import { CardPlayData, DeckDrawData } from './socketData.js';
import { Token } from './token.js';
import { TokenStore } from './tokenStore.js';

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
  initialDecks: Deck[];
  initialHand?: Record<DeckId, number>;
  initialResources?: Resource[];
  initialTokenStores?: TokenStore[];
  initialTokens?: Record<TokenId, number>;
  initialBoard?: Record<BoardId, CellData[]>;
  shuffleAndReconnectBoard?: Record<BoardId, (cells: CellData[]) => CellData[]>;
  pieceImage?: string;
  draggable?: Record<DraggableId, DraggableData>;
  initialPhase?: Phase;
  cardEffects?: Record<string, any>;
  cellEffects?: Record<string, (manager: RoomManager, player: PlayerId) => void>;
  onDeckDraw?: (state: RoomState, manager: RoomManager, data: DeckDrawData) => void;
  onCardPlay?: (state: RoomState, manager: RoomManager, data: CardPlayData) => void;
  onAllPlayersCardHold?: (state: RoomState, manager: RoomManager) => void;
  onPieceMove?: (state: RoomState, manager: RoomManager, newLocation: any) => void;
  onNextRound?: (state: RoomState, manager: RoomManager) => void;
  checkGameEnd?: (state: RoomState) => void;
  onGameEnd?: (state: RoomState) => any;
  components: ComponentInfo[];
};

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
  decks: Record<DeckId, Card[]>;
  playFieldCards: Record<DeckId, Card[]>;
  discardPile: Record<PlayerId, Card[]>;
  holdCards: Record<PlayerId, Record<DeckId, CardId[]>>;
  boards: Record<BoardId, CellData[]>;
  exploredCells: Position[];
  tokenStores: Record<TokenStoreId, Token[]>;
  draggable: Record<DraggableId, DraggableData>;
  timer: NodeJS.Timeout;
  maxZIndex: number;
  systemMessageHistory: string[];
};

/**
 * 利用可能なコンポーネントの種類一覧
 */
export const COMPONENT_TYPES = [
  'Deck',
  'PlayField',
  'ScoreBoard',
  'TokenStore',
  'GridBoard',
  'Draggable',
  'Dice',
  'Timer',
  'SystemMessage',
] as const;

/**
 * 利用可能なコンポーネントの種類一覧 (型)
 */
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export type ComponentInfo = {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
};

export type { GameId };
