// src/types/server.ts
import { Player } from '@/index.js';
import { RoomManager } from '@/server/server-utils.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { BoardId, CardId, DeckId, GameId, PlayerId, RoomId, TokenId } from './definition.js';
import { Phase } from './phase.js';
import { Position } from './position.js';
import { Resource } from './resource.js';
import { CardPlayData, DeckDrawData } from './socketData.js';
import { Token } from './token.js';
import { TokenStore } from './tokenStore.js';

/**
 * ゲームルーム作成時の初期設定パラメータ。
 * @param gameId - ゲームを一意に識別するID。
 * @param maxPlayers - 最大プレイヤー数（任意）。
 * @param initialDecks - デッキの初期構成リスト。
 * @param initialHand - 初期手札設定。{ deckId, count }
 * @param initialResources - プレイヤーの初期リソース。
 * @param initialTokenStores - 共有トークンの保管場所。
 * @param initialTokens - ボード上の初期配置トークン。
 * @param initialBoard - ボードの初期レイアウト。
 * @param initialPhase - 初期フェーズ。
 * @param cardEffects - カードの特殊効果定義。
 * @param cellEffects - セルの特殊効果定義。
 * @param onDeckDraw - デッキからカードを引いた時のカスタムフック。
 * @param onCardPlay - カードプレイ時のカスタムフック。
 * @param onNextRound - 次のラウンドへ進んだ時のカスタムフック。
 * @param checkGameEnd - 終了判定ロジック。
 * @param onGameEnd - リザルト生成ロジック。
 */
export type GameParam = {
  gameId: GameId;
  maxPlayers?: number;
  initialDecks: Deck[];
  initialHand?: {
    deckId: DeckId;
    count: number;
  };
  initialResources?: Resource[];
  initialTokenStores?: TokenStore[];
  initialTokens?: {
    tokenId: TokenId;
    count: number;
  };
  initialBoard?: Record<BoardId, any>;
  initialPhase?: Phase;
  cardEffects?: Record<string, any>;
  cellEffects?: any;
  onDeckDraw?: (state: RoomState, manager: RoomManager, data: DeckDrawData) => void;
  onCardPlay?: (state: RoomState, manager: RoomManager, data: CardPlayData) => void;
  onNextRound?: (state: RoomState, manager: RoomManager) => void;
  checkGameEnd?: (state: RoomState) => void;
  onGameEnd?: (state: RoomState) => any;
};

/**
 * 実行中のゲームルームの動的な状態を管理する。
 * @param gameId - 適用されているゲーム設定の識別ID。
 * @param roomId - ルームを一意に識別するID。
 * @param createdAt - ルームが作成されたタイムスタンプ。
 * @param maxPlayers - このルームの最大参加人数。
 * @param currentRoundIndex - 現在のラウンド数（0開始）。
 * @param currentTurnIndex - 現在のターン数（0開始）。
 * @param currentPhase - 現在の進行フェーズ。
 * @param players - 参加しているプレイヤーのリスト。
 * @param decks - 各デッキIDごとの残りカードリスト。
 * @param playFieldCards - プレイフィールド上のカード（キーは "firework" 等の場所名）。
 * @param discardPile - 捨て札置き場のカードリスト。
 * @param board - ボード上の2次元グリッドデータ。
 * @param exploredCells - すでに探索・公開されたセルの座標リスト。
 * @param tokenStores - 共有トークンの現在のストック状況。
 * @param systemMessageHistory - 過去のシステムメッセージの履歴。
 */
export interface RoomState {
  gameId: GameId;
  roomId: RoomId;
  createdAt: number;
  maxPlayers?: number;
  currentRoundIndex: number;
  currentTurnIndex: number;
  currentPhase?: Phase;
  players: Player[];
  decks: Record<DeckId, Card[]>;
  playFieldCards: Record<DeckId, Card[]>;
  discardPile: Record<DeckId, Card[]>;
  holdCards: Record<PlayerId, CardId[]>;
  board: Record<BoardId, any[][]>;
  exploredCells: Position[];
  tokenStores: Record<TokenId, Token[]>;
  systemMessageHistory: string[];
}

export { GameId };
