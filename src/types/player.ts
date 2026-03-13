// src/types/player.ts

import type { Card } from './card.js';
import type { PlayerId } from './definition.js';
import { Position } from './position.js';
import type { Resource } from './resource.js';
import type { Token } from './token.js';

/**
 * ゲームに参加するプレイヤーの状態を管理する型定義
 * @property {PlayerId} id - プレイヤーを一意に識別するためのID
 * @property {string} name - 画面に表示されるプレイヤーの表示名
 * @property {string} socketId - リアルタイム通信（Socket.io等）に使用する接続識別子
 * @property {string} color - プレイヤーのイメージカラー（HSL形式やHEX形式の文字列）
 * @property {Card[]} cards - プレイヤーが手札として所持しているカードの配列
 * @property {boolean} isHolding - カードをホールドしている状態かどうかのフラグ
 * @property {Token[]} tokens - プレイヤーが保有しているトークンのリスト
 * @property {Resource[]} resources - プレイヤーが所持している資源（リソース）のリスト
 * @property {number} score - 現在の獲得スコア
 * @property {Position} position - ゲームボード上におけるプレイヤーの現在位置
 * @property {Position} movableCells - ゲームボード上におけるプレイヤーが移動可能なセル
 */
export type Player = {
  id: PlayerId;
  name: string;
  socketId: string;
  color: string;
  cards: Card[];
  isHolding: boolean;
  tokens: Token[];
  resources: Resource[];
  score: number;
  position: Position;
  movableCells: any[];
};
