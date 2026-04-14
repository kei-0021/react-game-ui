// src/components/PlayerListItem.tsx
import { Player } from '@/types/player.js';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import { CardData } from '../types/card.js';
import { CardId, PlayerId, RoomId } from '../types/definition.js';
import type { Resource } from '../types/resource.js';
import { CardDisplayContent } from './Card.js';
import playerListItemStyles from './PlayerListItem.module.css';
import { Token } from './Token.js';

type PlayerListItemProps = {
  socket: Socket;
  roomId: RoomId;
  player: Player;
  currentPlayerId: PlayerId | null | undefined;
  myPlayerId: PlayerId | null;
  playCardButton: [boolean, boolean];
  selectedCards: CardId[];
  heldCards: CardId[];
  toggleCardSelection: (cardId: string, isOwner: boolean) => void;
  isDebug?: boolean;
  enabled: boolean;
};

export const PlayerListItem = React.memo(
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

    // --- スコアエフェクト用ステート ---
    const [scoreDiff, setScoreDiff] = React.useState<number | null>(null);
    const [isScoreUpdating, setIsScoreUpdating] = React.useState(false);
    const prevScoreRef = React.useRef(player.score);

    React.useEffect(() => {
      const prevScore = prevScoreRef.current;
      if (prevScore !== player.score) {
        const diff = player.score - prevScore;
        setScoreDiff(diff);
        setIsScoreUpdating(true);

        // バーストに合わせて短くクリア (600ms)
        const timer = setTimeout(() => {
          setScoreDiff(null);
          setIsScoreUpdating(false);
        }, 600);

        prevScoreRef.current = player.score;
        return () => clearTimeout(timer);
      }
    }, [player.score]);
    // ----------------------------

    const handleAddScore = (points: number) => {
      socket.emit('player:add-score', {
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
        className={`${playerListItemStyles.playerItem} ${isActive ? playerListItemStyles.activePlayer : ''}`}
        style={customStyles}
      >
        <div className={playerListItemStyles.playerHeader}>
          <span className={playerListItemStyles.playerName}>
            {isActive && 'ᐅ '}
            {isOwner && '★ ME '}
            {player.name}
          </span>
          <div className={playerListItemStyles.scoreArea}>
            <div
              className={playerListItemStyles.scoreWrapper}
              style={{ position: 'relative', display: 'inline-block' }}
            >
              <span className={playerListItemStyles.playerScore}>スコア: {player.score}</span>

              {/* ここで plus / minus クラスを付与して色を変える */}
              {scoreDiff !== null && (
                <span
                  className={`
      ${playerListItemStyles.scoreChange} 
      ${scoreDiff > 0 ? playerListItemStyles.plus : playerListItemStyles.minus}
    `}
                >
                  {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                </span>
              )}
            </div>
            {isDebug && (
              <div className={playerListItemStyles.debugScoreButtons}>
                <button
                  onClick={() => handleAddScore(-1)}
                  disabled={!enabled}
                  className={playerListItemStyles.debugBtn}
                >
                  -
                </button>
                <button onClick={() => handleAddScore(1)} disabled={!enabled} className={playerListItemStyles.debugBtn}>
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {player.resources?.length > 0 && (
          <div className={playerListItemStyles.resourceSection}>
            <div className={playerListItemStyles.resourceList}>
              {player.resources.map((resource: Resource) => (
                <span key={resource.resourceId} className={playerListItemStyles.resourceBadge}>
                  {resource.icon} {resource.name}: {resource.currentValue} / {resource.maxValue}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={playerListItemStyles.tokenList}>
          {Object.entries(player.tokens || {}).map(([tokenId, token]) => (
            <Token key={tokenId} token={token} />
          ))}
        </div>

        {player.isHolding && <p className={playerListItemStyles.isHoldMessage}>カードをホールドしています</p>}
        <div className={playerListItemStyles.cardList}>
          {player.cards.map((card: CardData) => {
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
                  ${playerListItemStyles.cardBase} 
                  ${isSelected ? playerListItemStyles.cardSelected : ''}
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
                {isHeld && <div className={playerListItemStyles.cardIsHeld}>🔐</div>}

                {/* ツールチップ */}
                {canSeeFront && card.description && (
                  <span className={playerListItemStyles.tooltip}>{card.description}</span>
                )}
              </div>
            );
          })}
        </div>
      </li>
    );
  },
);
