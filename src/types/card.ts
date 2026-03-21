// src/types/card.ts

import { CardLocation } from './cardLocation.js';
import { CardState } from './cardState.js';
import { Coordinate } from './coodinate.js';
import { CardId, DeckId, PlayerId } from './definition.js';

/**
 * @property {CardId} id - カードの一意な識別子
 * @property {DeckId} deckId - 所属するデッキのID
 * @property {string} name - カード名
 * @property {string} [description] - カードの効果やフレーバーテキスト
 * @property {Function} [onPlay] - プレイ時に実行されるコールバック
 * @property {PlayerId | null} ownerId - 現在このカードを保持しているプレイヤーID
 * @property {CardLocation} location - 現在のカードの配置場所
 * @property {[CardLocation, CardState]} drawCondition - カードを引くための条件 [場所, 状態]
 * @property {CardLocation} playLocation - プレイ時の移動先
 * @property {[CardLocation, CardState]} [fieldBackCondition] - プレイフィールドから戻る際の条件 [場所, 状態]
 * @property {boolean} isFaceUp - 表向きかどうか
 * @property {string} [frontImage] - 表面の画像URL
 * @property {string} backColor - 裏面のカラーコード
 * @property {Coordinate} [coordinate] - フィールド上の座標 (0-100%)
 * @property {boolean} [freeShape] - trueの場合、カード標準の枠線や背景を排除し、画像の形状を活かす（透過PNG用）
 * @property {number} - 重なり順。
 */
export type Card = {
  id: CardId;
  deckId: DeckId;
  name: string;
  description?: string;
  onPlay?: (...args: any[]) => void;
  ownerId: PlayerId | null;
  location: CardLocation;
  drawCondition: [CardLocation, CardState];
  playLocation: CardLocation;
  fieldBackCondition?: [CardLocation, CardState];
  isFaceUp: boolean;
  frontImage?: string;
  backColor: string;
  coordinate?: Coordinate;
  freeShape?: boolean;
  zIndex?: number;
};
