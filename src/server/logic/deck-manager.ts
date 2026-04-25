// src/server/logic/deck-manager.ts
import { CardLocation } from '@/types/cardLocation.js';
import { CardState } from '@/types/cardState.js';
import { CardId, DeckId, PlayerId, ResourceId, TokenId } from '@/types/definition.js';
import { GameParam } from '@/types/gameParam.js';
import { RoomState } from '@/types/roomState.js';
import { CardPlayData } from '@/types/socketData.js';
import { server_log } from '../log/logger.js';
import { roomInterpreter } from '../room-interpreter.js';
import type { RoomManager } from '../room-manager.js';

export class DeckManager {
  constructor(
    private param: GameParam,
    private state: RoomState,
  ) {}

  /**
   * カードをデッキから引く
   */
  drawCard(deckId: DeckId, condition: [CardLocation, CardState], playerId?: PlayerId) {
    const [targetLocation, targetState] = condition;

    // デッキから「deck」ロケーションにあるカードを抽出
    const currentDeck = this.state.decks[deckId].filter((c) => c.location === 'deck');
    if (!currentDeck.length) return false;

    const card = currentDeck[0];
    card.isFaceUp = targetState === 'face';

    let destination = '';

    // A. 捨て札へ
    if (targetLocation === 'discard') {
      card.location = 'discard';
      card.ownerId = null;
      this.state.discardPile[deckId].push(card);
      destination = 'discard';
    }
    // B. プレイヤーの手札へ
    else if (playerId && targetLocation === 'hand') {
      const player = this.state.players.find((p) => p.id === playerId);
      if (player) {
        card.location = 'hand';
        card.ownerId = playerId;
        player.cards.push(card);
        destination = playerId;
      }
    }
    // C. プレイフィールドへ
    else {
      card.location = 'field';
      card.ownerId = null;
      this.state.playFieldCards[deckId].push(card);
      destination = 'field';
    }

    server_log(
      'deck',
      this.state.gameId,
      this.state.roomId,
      `DRAW: ${card.name} (ID:${card.id}) (deck -> ${destination}, state: ${targetState})`,
    );
  }

  /**
   * デッキをシャッフルする
   */
  shuffleDeck = (deckId: DeckId) => {
    const targetDeck = this.state.decks[deckId];
    if (!targetDeck) return;

    const currentDeck = targetDeck.filter((c) => c.location === 'deck');
    const otherCards = targetDeck.filter((c) => c.location !== 'deck');
    for (let i = currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    this.state.decks[deckId] = currentDeck.concat(otherCards);

    server_log('deck', this.state.gameId, this.state.roomId, `${deckId} をシャッフル`);
  };

  /**
   * カードをプレイする
   */
  playCard(data: CardPlayData, roomManager: RoomManager): void {
    const { deckId, cardIds, playerId, playLocation = 'field', coordinate } = data;
    const ids = Array.isArray(cardIds) ? cardIds : [cardIds];

    const player = this.state.players.find((p) => p.id === playerId);
    if (player?.isHolding) {
      server_log(
        'card',
        this.state.gameId,
        this.state.roomId,
        `${playerId} はカードをホールドしているので、カードをプレイできません`,
      );
      return;
    }

    // カードごとに処理を行う
    ids.forEach((id) => {
      const card = this.state.decks[deckId]?.find((c) => c.id === id);
      if (!card) return;

      const p = this.state.players.find((p) => p.id === playerId);
      if (p) p.cards = p.cards.filter((c) => c.id !== id);

      card.location = playLocation;
      card.coordinate = coordinate;
      card.isFaceUp = true;

      this.state.playFieldCards[deckId] = this.state.playFieldCards[deckId].filter((c) => c.id !== id);
      this.state.discardPile[deckId] = this.state.discardPile[deckId].filter((c) => c.id !== id);

      if (playLocation === 'discard') {
        this.state.discardPile[deckId].push(card);
      } else {
        this.state.playFieldCards[deckId].push(card);
      }

      // 最前面に移動
      roomManager.updateZIndex('card', [deckId, card.id], true);

      server_log('card', this.state.gameId, this.state.roomId, `"${card.name}" をプレイした`);

      // カード効果
      const effect = this.param.cardEffects?.[card.name];
      if (effect) {
        server_log('card', this.state.gameId, this.state.roomId, `カード効果発揮: ${card.name} by ${playerId}`);
        effect({
          playerId,
          updateResource: (resourceId: ResourceId, amount: number) =>
            roomManager.acquireResource(playerId, resourceId, amount),
          updateToken: (tokenId: TokenId) => roomManager.acquireToken(this.state.roomId, playerId, tokenId),
        });
      }
    });

    // カスタムフック処理
    const onCardPlay = this.param.onCardPlay;
    if (onCardPlay) {
      roomInterpreter(onCardPlay, this.state, roomManager, data);
    }
  }

  /**
   * ホールド状態を解除し、カードを出す
   */
  unholdCards(roomManager: RoomManager): void {
    this.state.players.forEach((player) => {
      player.isHolding = false;

      // プレイヤーがホールドしているデータがない場合はスキップ
      const playerHoldData = this.state.holdCards[player.id];
      if (!playerHoldData) return;

      Object.entries(playerHoldData).forEach(([deckId, cardIds]) => {
        const playData: CardPlayData = {
          roomId: this.state.roomId,
          deckId: deckId,
          cardIds: cardIds,
          playerId: player.id,
          playLocation: 'field',
          coordinate: { x: 50, y: 50 },
        };
        roomManager.playCard(playData);
      });

      delete this.state.holdCards[player.id];
    });

    server_log('card', this.state.gameId, this.state.roomId, `プレイヤー全員のホールド状態を解除しました`);
  }

  /**
   * フィールドからカードを回収（手札に戻す or 捨て札へ）
   */
  moveFromField(deckId: DeckId, cardId: CardId, playerId?: PlayerId | null): void {
    const { playFieldCards, players, discardPile } = this.state;

    // 1. フィールドから対象カードを探して抜き取る
    const fieldList = playFieldCards[deckId] || [];
    const cardIndex = fieldList.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const [card] = fieldList.splice(cardIndex, 1);

    // 2. 表裏の状態を反映（fieldBackConditionの設定に従う）
    card.isFaceUp = card.fieldBackCondition?.[1] === 'face';

    // 3. 行き先の判定
    if (playerId) {
      // --- 手札に戻す場合 ---
      const player = players.find((p) => p.id === playerId);
      if (!player) return;

      card.location = 'hand';
      card.ownerId = playerId;
      player.cards = player.cards || [];
      player.cards.push(card);

      server_log('card', this.state.gameId, this.state.roomId, `Return: ${card.name} -> Player:${playerId}`);
    } else {
      // --- 捨て札に送る場合 ---
      card.location = 'discard';
      card.ownerId = null;
      discardPile[deckId] = discardPile[deckId] || [];
      discardPile[deckId].push(card);

      server_log('card', this.state.gameId, this.state.roomId, `Discard: ${card.name} -> discard`);
    }
  }
}
