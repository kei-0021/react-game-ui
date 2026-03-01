// -----------------------------------------------------------------
// 型定義 (TypeScript Interface)
// -----------------------------------------------------------------

import { Player } from '@/index.js';
import { RoomManager } from '@/server/server-utils.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { BoardId, DeckId, GameId, RoomId, TokenId } from './definition.js';
import { Position } from './position.js';
import { Resource } from './resource.js';
import { CardPlayData } from './socketData.js';
import { TokenStoreDef } from './tokenStore.js';

export type RoomMeta = {
  id: RoomId;
  gameId: GameId;
  playerCount: number;
  maxPlayers?: number;
  createdAt: number;
};

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
 * @param cardEffects - カードの特殊効果定義。
 * @param cellEffects - セルの特殊効果定義。
 * @param onDeckDraw - デッキからカードを引いた時のカスタムフック。
 * @param onCardPlay - カードプレイ時のカスタムフック。
 * @param checkGameEnd - 終了判定ロジック。
 * @param onGameEnd - リザルト生成ロジック。
 */
export type RoomParam = {
  gameId: GameId;
  maxPlayers?: number;
  initialDecks: Deck[];
  initialHand?: {
    deckId: DeckId;
    count: number;
  };
  initialResources?: Resource[];
  initialTokenStores?: TokenStoreDef[];
  initialTokens?: {
    tokenId: TokenId;
    count: number;
  };
  initialBoard?: Record<BoardId, any>;
  cardEffects?: Record<string, any>;
  cellEffects?: any;
  onDeckDraw?: any;
  onCardPlay?: (param: RoomParam, state: RoomState, data: CardPlayData) => void;
  checkGameEnd?: any;
  onGameEnd?: any;
};

export type InitialRoomState = {
  players: Player[];
  initialResources: any[];
  initialTokenStores: any[];
  initialTokens: any[];
  board: Record<BoardId, any[][]>;
  exploredCells: Position[];
  turn: number;
};

export interface RoomState {
  roomId: RoomId;
  gameId: GameId;
  createdAt: number;
  maxPlayers?: number;
  currentRoundIndex: number;
  currentTurnIndex: number;
  decks: Record<DeckId, Card[]>;
  drawnCards: Record<string, Card[]>;
  playFieldCards: Record<string, Card[]>;
  discardPile: Record<string, Card[]>;
  initRoomState: RoomManager;
  checkGameEnd: any;
  onGameEnd: any;
}

export { GameId };
