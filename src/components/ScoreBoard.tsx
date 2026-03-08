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
  selectedCards: string[];
  toggleCardSelection: (cardId: string, isOwner: boolean) => void;
  socket: Socket;
  roomId: RoomId;
  isDebug?: boolean;
};

const PlayerListItem = React.memo(
  ({
    player,
    currentPlayerId,
    myPlayerId,
    selectedCards,
    toggleCardSelection,
    socket,
    roomId,
    isDebug,
  }: PlayerListItemProps) => {
    const isActive = player.id === currentPlayerId;
    const playerColor = (player as any).color || '#aaaaaa';
    const isOwner = player.id === myPlayerId;

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
                <button onClick={() => handleAddScore(-1)} className={scoreBoardStyles.debugBtn}>
                  -
                </button>
                <button onClick={() => handleAddScore(1)} className={scoreBoardStyles.debugBtn}>
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
              className={`${scoreBoardStyles.tokenBadge} ${myPlayerId === player.id ? scoreBoardStyles.tokenBadgeOwner : scoreBoardStyles.tokenBadgeGuest}`}
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

        <div>{player.isHolding && 'カードをホールドしています'}</div>
        <div className={scoreBoardStyles.cardList}>
          {player.cards.map((card: Card) => {
            const isSelected = selectedCards.includes(card.id);
            const canSeeFront = !!card.isFaceUp || isOwner;

            return (
              <div
                key={card.id}
                draggable={isOwner}
                onDragStart={(e) => {
                  if (!isOwner) return;
                  e.dataTransfer.setData('cardId', card.id);
                  e.dataTransfer.setData('deckId', card.deckId);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className={`${scoreBoardStyles.cardBase} rg-playfield-card-wrapper ${
                  isSelected ? scoreBoardStyles.cardSelected : ''
                } ${card.isFaceUp ? scoreBoardStyles.cardSuperRevealed : ''}`}
                style={
                  {
                    cursor: isOwner ? 'grab' : 'default',
                    border: card.isFaceUp ? '3px solid #00ffff' : '1px solid #ccc',
                    boxShadow: card.isFaceUp ? '0 0 10px #00ffff' : 'none',
                    padding: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'stretch',
                    justifyContent: 'stretch',
                  } as React.CSSProperties
                }
                onClick={() => toggleCardSelection(card.id, isOwner)}
              >
                <CardDisplayContent card={card} canSeeFront={canSeeFront} />
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
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {string} roomId - 現在のルームID
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト
 * @param {string | null} currentPlayerId - 現在の手番のプレイヤーID
 * @param {string | null} myPlayerId - ローカルプレイヤーのID
 * @param {number} playCardLimit - 1ターンにプレイ可能なカードの上限枚数
 * @param {boolean} autoNextTurnOnCardPlay=false - カードプレイ時に自動でターンを終了するかどうか
 * @param {boolean} holdButton=false - カードを一定期間ホールドしつつプレイするボタンの表示・非表示
 * @param {boolean} revealButton=false - カード公開ボタンの表示・非表示
 * @param {boolean} turnSkipButton=false - ターンスキップボタンの表示・非表示
 * @param {boolean} roundSkipButton=false - ラウンドスキップボタンの表示・非表示
 * @param {booleam} isDebug=false - スコアを手動で増減できるようにするかどうか (デバッグ用)
 */
export function ScoreBoard({
  socket,
  roomId,
  players,
  currentPlayerId,
  myPlayerId,
  playCardLimit,
  autoNextTurnOnCardPlay = false,
  holdButton = false,
  revealButton = false,
  turnSkipButton = false,
  roundSkipbutton = false,
  isDebug = false,
}: {
  socket: Socket;
  roomId: RoomId;
  players: Player[];
  currentPlayerId?: PlayerId | null;
  myPlayerId: PlayerId | null;
  playCardLimit?: number;
  autoNextTurnOnCardPlay?: boolean;
  holdButton?: boolean;
  revealButton?: boolean;
  turnSkipButton?: boolean;
  roundSkipbutton?: boolean;
  isDebug?: boolean;
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

      selectedCards.forEach((cardId) => {
        const card = myPlayer.cards.find((c) => c.id === cardId);
        if (!card) return;
        if (!targetPlayLocation) targetPlayLocation = card.playLocation as CardLocation;
        if (!cardsByDeck[card.deckId]) cardsByDeck[card.deckId] = [];
        cardsByDeck[card.deckId].push(card.id);
      });

      if (isHold == true) {
        socket.emit('card:hold', { roomId: roomId, playerId: myPlayerId, cardIdsbyDeck: cardsByDeck } as CardHoldData);
        setSelectedCards([]);
        return;
      }

      if (!targetPlayLocation) return;
      const finalLocation: CardLocation = targetPlayLocation;

      Object.entries(cardsByDeck).forEach(([deckId, cardIds]) => {
        const playData: CardPlayData = {
          roomId,
          deckId,
          cardIds,
          playerId: myPlayerId,
          playLocation: finalLocation,
          coordinate: { x: 50, y: 50 },
        };

        socket.emit('card:play', playData);
      });

      if (autoNextTurnOnCardPlay) socket.emit('game:next-turn', { roomId } as GameNextTrunData);
      setSelectedCards([]);
    },
    [selectedCards, myPlayerId, displayedPlayers, socket, roomId, playCardLimit, autoNextTurnOnCardPlay],
  );

  const revealSelectedCards = React.useCallback(() => {
    if (selectedCards.length === 0 || !myPlayerId) return;
    if (playCardLimit !== undefined && selectedCards.length > playCardLimit) return;

    socket.emit('card:reveal', {
      roomId,
      playerId: myPlayerId,
      cardIds: selectedCards,
    });

    if (autoNextTurnOnCardPlay) socket.emit('game:next-turn', { roomId } as GameNextTrunData);
    setSelectedCards([]);
  }, [selectedCards, myPlayerId, socket, roomId, playCardLimit, autoNextTurnOnCardPlay]);

  const nextTurn = () => socket.emit('game:next-turn', { roomId } as GameNextTrunData);
  const nextRound = () => socket.emit('game:next-round', { roomId } as GameNextRoundData);

  const isOverLimit = playCardLimit !== undefined && selectedCards.length > playCardLimit;
  const isActionDisabled = selectedCards.length === 0 || isOverLimit;

  return (
    <div className={scoreBoardStyles.container}>
      <h2 className={scoreBoardStyles.title}>ゲームスコアボード</h2>
      <ul className={scoreBoardStyles.playerList}>
        {displayedPlayers.map((player) => (
          <PlayerListItem
            key={player.id}
            player={player}
            currentPlayerId={currentPlayerId}
            myPlayerId={myPlayerId}
            selectedCards={selectedCards}
            toggleCardSelection={toggleCardSelection}
            socket={socket}
            roomId={roomId}
            isDebug={isDebug}
          />
        ))}
      </ul>

      <div className={scoreBoardStyles.buttonArea}>
        {isOverLimit && (
          <p className={scoreBoardStyles.limitMessage}>一度に出せるカードは {playCardLimit} 枚までです</p>
        )}

        <div className={scoreBoardStyles.buttonGroup}>
          <button onClick={() => playSelectedCards()} disabled={isActionDisabled}>
            選択カードを出す
          </button>
          {holdButton && (
            <button onClick={() => playSelectedCards({ isHold: true })} disabled={isActionDisabled}>
              選択カードをホールドする
            </button>
          )}
          {revealButton && <button onClick={revealSelectedCards}>選択カードを公開する</button>}
          {turnSkipButton && <button onClick={nextTurn}>ターンをスキップ</button>}
          {roundSkipbutton && <button onClick={nextRound}>ラウンドをスキップ</button>}
        </div>
      </div>
    </div>
  );
}
