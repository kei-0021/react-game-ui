import * as React from "react";
import { Socket } from "socket.io-client";
import { Card } from "../types/card.js";
import { PlayerId, RoomId } from "../types/definition.js";
import { PlayerWithResources } from "../types/playerWithResources.js";
import type { Resource } from "../types/resource.js";
import { Token } from "../types/token.js";
import styles from "./ScoreBoard.module.css";

type DisplayedPlayer = PlayerWithResources & {
  score: number;
  cards: Card[];
  resources: Resource[];
  tokens: Token[];
};

type PlayerListItemProps = {
  player: DisplayedPlayer;
  currentPlayerId: PlayerId | null | undefined;
  myPlayerId: PlayerId | null;
  selectedCards: string[];
  toggleCardSelection: (cardId: string, isOwner: boolean) => void;
  socket: Socket;
  roomId: RoomId;
};

const CardDisplayContent = React.memo(
  ({ card, canSeeFront }: { card: Card; canSeeFront: boolean }) => {
    if (!canSeeFront) return null;
    if (card.frontImage) {
      return (
        <img
          src={card.frontImage}
          alt={card.name}
          className={styles.cardImage}
        />
      );
    }
    return <strong className={styles.cardNameText}>{card.name}</strong>;
  },
);

const TokenDisplayContent = React.memo(
  ({ tokens, socket, roomId, myPlayerId, playerIdBeingDisplayed }: any) => {
    const isMyToken = myPlayerId === playerIdBeingDisplayed;
    if (!tokens || tokens.length === 0) return null;

    return (
      <div className={styles.tokenList}>
        {tokens.map((token: Token) => (
          <div
            key={token.id}
            className={`${styles.tokenBadge} ${
              isMyToken ? styles.tokenBadgeOwner : styles.tokenBadgeGuest
            }`}
            onClick={() => {
              if (!isMyToken) return;
              socket.emit("token:reclaim", {
                roomId,
                playerId: myPlayerId,
                tokenId: token.id,
              });
            }}
          >
            {token.name}
          </div>
        ))}
      </div>
    );
  },
);

const PlayerListItem = React.memo(
  ({
    player,
    currentPlayerId,
    myPlayerId,
    selectedCards,
    toggleCardSelection,
    socket,
    roomId,
  }: PlayerListItemProps) => {
    const isActive = player.id === currentPlayerId;
    const playerColor = (player as any).color || "#aaaaaa";
    const isOwner = player.id === myPlayerId;

    const customStyles = {
      "--player-color": playerColor,
      "--player-color-bg": playerColor
        .replace("hsl", "hsla")
        .replace(")", ", 0.3)"),
      "--player-color-glow": playerColor
        .replace("hsl", "hsla")
        .replace(")", ", 0.5)"),
    } as React.CSSProperties;

    return (
      <li
        className={`${styles.playerItem} ${isActive ? styles.activePlayer : ""}`}
        style={customStyles}
      >
        <div className={styles.playerHeader}>
          <span className={styles.playerName}>
            {isActive && "ᐅ "}
            {isOwner && "★ ME "}
            {player.name}
          </span>
          <span className={styles.playerScore}>スコア: {player.score}</span>
        </div>

        {player.resources?.length > 0 && (
          <div className={styles.resourceSection}>
            <div className={styles.resourceList}>
              {player.resources.map((resource: Resource) => (
                <span key={resource.id} className={styles.resourceBadge}>
                  {resource.icon} {resource.name}: {resource.currentValue} /{" "}
                  {resource.maxValue}
                </span>
              ))}
            </div>
          </div>
        )}

        <TokenDisplayContent
          tokens={player.tokens}
          socket={socket}
          roomId={roomId}
          myPlayerId={myPlayerId}
          playerIdBeingDisplayed={player.id}
        />

        <div className={styles.cardList}>
          {player.cards.map((card: Card) => {
            const isSelected = selectedCards.includes(card.id);
            const canSeeFront = !!card.isFaceUp || isOwner;

            return (
              <div
                key={card.id}
                className={`${styles.cardBase} rg-playfield-card-wrapper ${
                  isSelected ? styles.cardSelected : ""
                } ${card.isFaceUp ? styles.cardSuperRevealed : ""}`}
                style={
                  {
                    "--owner-color": playerColor,
                    "backgroundColor": canSeeFront ? "#fff" : card.backColor,
                    "cursor": isOwner ? "pointer" : "default",
                    "border": card.isFaceUp
                      ? "3px solid #00ffff"
                      : "1px solid #ccc",
                    "boxShadow": card.isFaceUp ? "0 0 10px #00ffff" : "none",
                  } as React.CSSProperties
                }
                onClick={() => toggleCardSelection(card.id, isOwner)}
              >
                <CardDisplayContent card={card} canSeeFront={canSeeFront} />
                {canSeeFront && card.description && (
                  <span className={styles.tooltip}>{card.description}</span>
                )}
              </div>
            );
          })}
        </div>
      </li>
    );
  },
);

export default function ScoreBoard({
  socket,
  players,
  currentPlayerId,
  myPlayerId,
  roomId,
  playCardLimit,
  autoNextTurnOnCardPlay = false,
}: {
  socket: Socket;
  players: PlayerWithResources[];
  currentPlayerId?: PlayerId | null;
  myPlayerId: PlayerId | null;
  roomId: RoomId;
  playCardLimit?: number;
  autoNextTurnOnCardPlay?: boolean;
}) {
  const displayedPlayers: DisplayedPlayer[] = React.useMemo(() => {
    return (players || []).map((p: PlayerWithResources) => ({
      ...p,
      score: p.score ?? 0,
      cards: p.cards ?? [],
      resources: p.resources ?? [],
      tokens: p.tokens ?? [],
    }));
  }, [players]);

  const [selectedCards, setSelectedCards] = React.useState<string[]>([]);

  const toggleCardSelection = React.useCallback(
    (cardId: string, isOwner: boolean) => {
      if (!isOwner) return;
      setSelectedCards((prev) =>
        prev.includes(cardId)
          ? prev.filter((id) => id !== cardId)
          : [...prev, cardId],
      );
    },
    [],
  );

  // 公開する
  const revealSelectedCards = React.useCallback(() => {
    if (selectedCards.length === 0 || !myPlayerId) return;
    if (playCardLimit !== undefined && selectedCards.length > playCardLimit)
      return;

    socket.emit("card:reveal", {
      roomId,
      playerId: myPlayerId,
      cardIds: selectedCards,
    });

    if (autoNextTurnOnCardPlay) socket.emit("game:next-turn", { roomId });
    setSelectedCards([]);
  }, [
    selectedCards,
    myPlayerId,
    socket,
    roomId,
    playCardLimit,
    autoNextTurnOnCardPlay,
  ]);

  // 出す（プレイする）
  const playSelectedCards = React.useCallback(() => {
    if (selectedCards.length === 0 || !myPlayerId) return;
    if (playCardLimit !== undefined && selectedCards.length > playCardLimit)
      return;

    const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
    if (!myPlayer) return;

    const cardsByDeck: Record<string, string[]> = {};
    let targetPlayLocation: string | undefined;

    selectedCards.forEach((cardId) => {
      const card = myPlayer.cards.find((c) => c.id === cardId);
      if (!card) return;
      if (!targetPlayLocation) targetPlayLocation = card.playLocation as string;
      if (!cardsByDeck[card.deckId]) cardsByDeck[card.deckId] = [];
      cardsByDeck[card.deckId].push(card.id);
    });

    if (!targetPlayLocation) return;

    Object.entries(cardsByDeck).forEach(([deckId, cardIds]) => {
      socket.emit("card:play", {
        roomId,
        deckId,
        cardIds,
        playerId: myPlayerId,
        playLocation: targetPlayLocation,
      });
    });

    if (autoNextTurnOnCardPlay) socket.emit("game:next-turn", { roomId });
    setSelectedCards([]);
  }, [
    selectedCards,
    myPlayerId,
    displayedPlayers,
    socket,
    roomId,
    playCardLimit,
    autoNextTurnOnCardPlay,
  ]);

  const nextTurn = () => socket.emit("game:next-turn", { roomId });

  const isOverLimit =
    playCardLimit !== undefined && selectedCards.length > playCardLimit;
  const isActionDisabled = selectedCards.length === 0 || isOverLimit;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ゲームスコアボード</h2>
      <ul className={styles.playerList}>
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
          />
        ))}
      </ul>

      <div className={styles.buttonArea}>
        {isOverLimit && (
          <p className={styles.limitMessage}>
            一度に出せるカードは {playCardLimit} 枚までです
          </p>
        )}

        <div className={styles.buttonGroup}>
          <button onClick={playSelectedCards} disabled={isActionDisabled}>
            選択カードを出す
          </button>
          <button onClick={revealSelectedCards} disabled={isActionDisabled}>
            選択カードを公開する
          </button>
          <button onClick={nextTurn}>ターンをスキップ</button>
        </div>
      </div>
    </div>
  );
}
