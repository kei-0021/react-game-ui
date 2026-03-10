// src/components/ScoreBoard.tsx
import { CardLocation } from '@/types/cardLocation.js';
import { Player } from '@/types/player.js';
import { CardHoldData, CardPlayData, GameNextRoundData, GameNextTrunData } from '@/types/socketData.js';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import { Card } from '../types/card.js';
import { CardId, PlayerId, RoomId } from '../types/definition.js';
import type { Resource } from '../types/resource.js';
import { Token } from '../types/token.js';
import { CardDisplayContent } from './Card.js';
import scoreBoardStyles from './ScoreBoard.module.css';
import { TokenDisplayContent } from './Token.js';

type PlayerListItemProps = {
  player: Player;
  currentPlayerId: PlayerId | null | undefined;
  myPlayerId: PlayerId | null;
  playCardButton: [boolean, boolean];
  selectedCards: CardId[];
  heldCards: CardId[];
  toggleCardSelection: (cardId: string, isOwner: boolean) => void;
  socket: Socket;
  roomId: RoomId;
  isDebug?: boolean;
  enabled: boolean;
};

const PlayerListItem = React.memo(
  ({
    socket,
    roomId,
    player,
    currentPlayerId,
    myPlayerId,
    playCardButton,
    selectedCards,
    heldCards,
    toggleCardSelection,
    isDebug,
    enabled,
  }: PlayerListItemProps) => {
    const isActive = player.id === currentPlayerId;
    const playerColor = (player as any).color || '#aaaaaa';
    const isOwner = player.id === myPlayerId;
    const [showPlay] = playCardButton;

    const handleAddScore = (points: number) => {
      socket.emit('room:player:add-score', {
        roomId,
        targetPlayerId: player.id,
        points,
      });
    };

    const customStyles = {
      '--player-color': playerColor,
      '--player-color-bg': playerColor.replace('hsl', 'hsla').replace(')', ', 0.3)'),
      '--player-color-glow': playerColor.replace('hsl', 'hsla').replace(')', ', 0.5)'),
    } as React.CSSProperties;

    return (
      <li
        className={`${scoreBoardStyles.playerItem} ${isActive ? scoreBoardStyles.activePlayer : ''}`}
        style={customStyles}
      >
        <div className={scoreBoardStyles.playerHeader}>
          <span className={scoreBoardStyles.playerName}>
            {isActive && 'ᐅ '}
            {isOwner && '★ ME '}
            {player.name}
          </span>
          <div className={scoreBoardStyles.scoreArea}>
            <span className={scoreBoardStyles.playerScore}>スコア: {player.score}</span>
            {isDebug && (
              <div className={scoreBoardStyles.debugScoreButtons}>
                <button onClick={() => handleAddScore(-1)} disabled={!enabled} className={scoreBoardStyles.debugBtn}>
                  -
                </button>
                <button onClick={() => handleAddScore(1)} disabled={!enabled} className={scoreBoardStyles.debugBtn}>
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {player.resources?.length > 0 && (
          <div className={scoreBoardStyles.resourceSection}>
            <div className={scoreBoardStyles.resourceList}>
              {player.resources.map((resource: Resource) => (
                <span key={resource.resourceId} className={scoreBoardStyles.resourceBadge}>
                  {resource.icon} {resource.name}: {resource.currentValue} / {resource.maxValue}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={scoreBoardStyles.tokenList}>
          {player.tokens.map((token: Token) => (
            <div
              key={token.id}
              onClick={() => {
                socket.emit('token:reclaim', {
                  roomId,
                  playerId: myPlayerId,
                  tokenId: token.id,
                });
              }}
            >
              <TokenDisplayContent token={token} />
            </div>
          ))}
        </div>

        {player.isHolding && <p className={scoreBoardStyles.isHoldMessage}>カードをホールドしています</p>}
        <div className={scoreBoardStyles.cardList}>
          {player.cards.map((card: Card) => {
            const isSelected = selectedCards.includes(card.id);
            const isHeld = heldCards.includes(card.id);
            const canSeeFront = !!card.isFaceUp || isOwner;

            return (
              <div
                key={card.id}
                // ホールド中、オーナーでない場合、カードプレイボタンがない場合はドラッグ不可
                draggable={isOwner && !isHeld && enabled}
                onDragStart={(e) => {
                  if (!isOwner || isHeld || !showPlay) return;
                  e.dataTransfer.setData('cardId', card.id);
                  e.dataTransfer.setData('deckId', card.deckId);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className={`
                  ${scoreBoardStyles.cardBase} 
                  ${isSelected ? scoreBoardStyles.cardSelected : ''}
                `}
                style={
                  {
                    // ホールド中は禁止マーク、オーナーなら掴める、それ以外はデフォルト
                    cursor: isHeld ? 'not-allowed' : isOwner && enabled ? 'grab' : 'default',
                    border: card.isFaceUp ? '3px solid #00ffff' : '1px solid #ccc',
                    boxShadow: card.isFaceUp ? '0 0 10px #00ffff' : 'none',
                    opacity: !enabled || isHeld ? 0.7 : 1,
                    padding: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'stretch',
                    justifyContent: 'stretch',
                  } as React.CSSProperties
                }
                // ホールド中はクリック（選択）も無効化
                onClick={() => !isHeld && enabled && toggleCardSelection(card.id, isOwner)}
              >
                {/* カードのメインコンテンツ */}
                <CardDisplayContent card={card} canSeeFront={canSeeFront} />

                {/* 鍵マークのオーバーレイ表示 */}
                {isHeld && <div className={scoreBoardStyles.cardIsHeld}>🔐</div>}

                {/* ツールチップ */}
                {canSeeFront && card.description && (
                  <span className={scoreBoardStyles.tooltip}>{card.description}</span>
                )}
              </div>
            );
          })}
        </div>
      </li>
    );
  },
);

/**
 * スコアボードコンポーネント
 * プレイヤーの一覧、現在のターン、各プレイヤーのスコアやトークン数を表示する
 * 各ボタンのプロパティは [表示/非表示, 有効/無効] のタプル形式で受け取り、
 * 個別の有効フラグが `enabled` (全体設定) よりも優先して適用される。
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト
 * @param {PlayerId | null} [currentPlayerId] - 現在の手番のプレイヤーID
 * @param {PlayerId | null} myPlayerId - ローカルプレイヤーのID
 * @param {number} [playCardLimit] - 1ターンにプレイ可能なカードの上限枚数
 * @param {[boolean, boolean]} [playCardButton=[true, true]] - カードプレイボタンの [表示, 有効]
 * @param {[boolean, boolean]} [holdButton=[false, true]] - カードホールドボタンの [表示, 有効]
 * @param {[boolean, boolean]} [revealButton=[false, true]] - カード公開ボタンの [表示, 有効]
 * @param {[boolean, boolean]} [turnSkipButton=[false, true]] - ターンスキップボタンの [表示, 有効]
 * @param {[boolean, boolean]} [roundSkipButton=[false, true]] - ラウンドスキップボタンの [表示, 有効]
 * @param {boolean} [isDebug=false] - スコアを手動で増減できるようにするかどうか (デバッグ用)
 * @param {boolean} [enabled=true] - 各種操作が全体的に有効かどうかのフラグ (個別設定がない場合のデフォルト)
 */
export function ScoreBoard({
  socket,
  roomId,
  players,
  currentPlayerId,
  myPlayerId,
  playCardLimit,
  playCardButton = [true, true],
  holdButton = [false, true],
  revealButton = [false, true],
  turnSkipButton = [false, true],
  roundSkipButton = [false, true],
  isDebug = false,
  enabled = true,
}: {
  socket: Socket;
  roomId: RoomId;
  players: Player[];
  currentPlayerId?: PlayerId | null;
  myPlayerId: PlayerId | null;
  playCardLimit?: number;
  autoNextTurnOnCardPlay?: boolean;
  playCardButton?: [boolean, boolean];
  holdButton?: [boolean, boolean];
  revealButton?: [boolean, boolean];
  turnSkipButton?: [boolean, boolean];
  roundSkipButton?: [boolean, boolean];
  isDebug?: boolean;
  enabled?: boolean;
}) {
  const displayedPlayers: Player[] = React.useMemo(() => {
    return (players || []).map((p: Player) => ({
      ...p,
      score: p.score ?? 0,
      cards: p.cards ?? [],
      resources: p.resources ?? [],
      tokens: p.tokens ?? [],
    }));
  }, [players]);

  const [selectedCards, setSelectedCards] = React.useState<CardId[]>([]);
  const [heldCards, setHeldCards] = React.useState<CardId[]>([]);

  const toggleCardSelection = React.useCallback((cardId: CardId, isOwner: boolean) => {
    if (!isOwner) return;
    setSelectedCards((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]));
  }, []);

  const playSelectedCards = React.useCallback(
    ({ isHold = false } = {}) => {
      if (selectedCards.length === 0 || !myPlayerId) return;
      if (playCardLimit !== undefined && selectedCards.length > playCardLimit) return;

      const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
      if (!myPlayer) return;

      const cardsByDeck: Record<string, string[]> = {};
      let targetPlayLocation: CardLocation | undefined;

      if (isHold && myPlayer.isHolding == true) return;

      selectedCards.forEach((cardId) => {
        const card = myPlayer.cards.find((c) => c.id === cardId);
        if (!card) return;
        if (!targetPlayLocation) targetPlayLocation = card.playLocation as CardLocation;
        if (!cardsByDeck[card.deckId]) cardsByDeck[card.deckId] = [];
        cardsByDeck[card.deckId].push(card.id);
        if (isHold) setHeldCards((prev) => [...prev, card.id]);
      });

      if (isHold == true) {
        socket.emit('card:hold', { roomId: roomId, playerId: myPlayerId, cardIdsbyDeck: cardsByDeck } as CardHoldData);
        setSelectedCards([]);
        return;
      }

      if (!targetPlayLocation) return;
      const finalLocation: CardLocation = targetPlayLocation;

      Object.entries(cardsByDeck).forEach(([deckId, cardIds]) => {
        socket.emit('card:play', {
          roomId,
          deckId,
          cardIds,
          playerId: myPlayerId,
          playLocation: finalLocation,
          coordinate: { x: 50, y: 50 },
        } as CardPlayData);
      });

      setSelectedCards([]);
    },
    [selectedCards, myPlayerId, displayedPlayers, socket, roomId, playCardLimit],
  );

  const revealSelectedCards = React.useCallback(() => {
    if (selectedCards.length === 0 || !myPlayerId) return;
    socket.emit('card:reveal', { roomId, playerId: myPlayerId, cardIds: selectedCards });
    setSelectedCards([]);
  }, [selectedCards, myPlayerId, socket, roomId]);

  // 各ボタンの状態を分解
  const [showPlay, canPlay] = playCardButton;
  const [showHold, canHold] = holdButton;
  const [showReveal, canReveal] = revealButton;
  const [showTurnSkip, canTurnSkip] = turnSkipButton;
  const [showRoundSkip, canRoundSkip] = roundSkipButton;

  // 無効判定ロジック：個別設定がある場合はそちらを優先、なければ全体のenabledを参照
  const isPlayDisabled = (canPlay !== undefined ? !canPlay : !enabled) || selectedCards.length === 0;
  const isHoldDisabled = (canHold !== undefined ? !canHold : !enabled) || selectedCards.length === 0;
  const isRevealDisabled = (canReveal !== undefined ? !canReveal : !enabled) || selectedCards.length === 0;
  const isTurnSkipDisabled = canTurnSkip !== undefined ? !canTurnSkip : !enabled;
  const isRoundSkipDisabled = canRoundSkip !== undefined ? !canRoundSkip : !enabled;

  const isOverLimit = playCardLimit !== undefined && selectedCards.length > playCardLimit;

  return (
    <div className={scoreBoardStyles.container}>
      <h2 className={scoreBoardStyles.title}>ゲームスコアボード</h2>
      <ul className={scoreBoardStyles.playerList}>
        {displayedPlayers.map((player) => (
          <PlayerListItem
            socket={socket}
            roomId={roomId}
            key={player.id}
            player={player}
            currentPlayerId={currentPlayerId}
            myPlayerId={myPlayerId}
            playCardButton={playCardButton}
            selectedCards={selectedCards}
            heldCards={heldCards}
            toggleCardSelection={toggleCardSelection}
            isDebug={isDebug}
            enabled={enabled}
          />
        ))}
      </ul>

      <div className={scoreBoardStyles.buttonArea}>
        {isOverLimit && (
          <p className={scoreBoardStyles.limitMessage}>一度に出せるカードは {playCardLimit} 枚までです</p>
        )}

        <div className={scoreBoardStyles.buttonGroup}>
          {showPlay && (
            <button onClick={() => playSelectedCards()} disabled={isPlayDisabled || isOverLimit}>
              選択カードを出す
            </button>
          )}
          {showHold && (
            <button onClick={() => playSelectedCards({ isHold: true })} disabled={isHoldDisabled || isOverLimit}>
              選択カードをホールドする
            </button>
          )}
          {showReveal && (
            <button onClick={revealSelectedCards} disabled={isRevealDisabled || isOverLimit}>
              選択カードを公開する
            </button>
          )}
          {showTurnSkip && (
            <button
              onClick={() => socket.emit('game:next-turn', { roomId } as GameNextTrunData)}
              disabled={isTurnSkipDisabled}
            >
              ターンをスキップ
            </button>
          )}
          {showRoundSkip && (
            <button
              onClick={() => socket.emit('game:next-round', { roomId } as GameNextRoundData)}
              disabled={isRoundSkipDisabled}
            >
              ラウンドをスキップ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
