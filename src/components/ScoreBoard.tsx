import * as React from "react";
import { Socket } from "socket.io-client";
import { Card } from "../types/card.js";
import { PlayerId, RoomId } from "../types/definition.js";
import { PlayerWithResources } from "../types/playerWithResources.js";
import type { Resource } from "../types/resource.js";
import { Token } from "../types/token.js";
import styles from "./Card.module.css";

// =========================================================================
// カード表面の内容をレンダリング（React.memo）
// =========================================================================
const CardDisplayContent = React.memo(({ card, isFaceUp }: { card: Card, isFaceUp: boolean }) => {
    if (!isFaceUp) return null;

    if (card.frontImage) {
      return (
        <img 
          src={card.frontImage} 
          alt={card.name} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      );
    }
    
    return (
      <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', width: '100%', padding: '5px', color: '#333'
      }}>
          <strong style={{ fontSize: '0.8em', wordBreak: 'break-all', textAlign: 'center' }}>
              {card.name}
          </strong>
      </div>
    );
});

// =========================================================================
// トークン表示用 (React.memo)
// =========================================================================
const TokenDisplayContent = React.memo(({ tokens, socket, roomId, myPlayerId, playerIdBeingDisplayed } : { 
    tokens?: Token[], 
    socket: Socket,
    roomId: RoomId,
    myPlayerId: PlayerId | null,
    playerIdBeingDisplayed: PlayerId
}) => {
    const isMyToken = myPlayerId === playerIdBeingDisplayed;

    if (!tokens || tokens.length === 0) return null;
    
    return (
        <div style={{ 
            display: 'flex', flexWrap: 'wrap', gap: '8px', 
            marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd',
        }}>
            {tokens.map(token => (
                <div 
                    key={token.id} 
                    title={isMyToken ? `クリックして再獲得: ${token.name}` : token.name}
                    style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#fff', borderRadius: '50%', 
                        width: '48px', height: '48px',
                        fontSize: '0.75em', fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)', 
                        cursor: isMyToken ? 'pointer' : 'default', 
                        opacity: isMyToken ? 1 : 0.7,
                        flexShrink: 0, padding: '2px'
                    }}
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
});

// =========================================================================
// PlayerListItem（1プレイヤー分）
// =========================================================================
type DisplayedPlayer = PlayerWithResources & { score: number, cards: Card[], resources: Resource[], tokens: Token[] };

type PlayerListItemProps = {
    player: DisplayedPlayer;
    currentPlayerId: PlayerId | null | undefined;
    myPlayerId: PlayerId | null;
    selectedCards: string[];
    toggleCardSelection: (cardId: string, isFaceUp: boolean) => void;
    socket: Socket;
    roomId: RoomId;
};

const PlayerListItem = React.memo(({
    player,
    currentPlayerId,
    myPlayerId,
    selectedCards,
    toggleCardSelection,
    socket,
    roomId,
}: PlayerListItemProps) => {

    return (
        <li
            key={player.id}
            style={{
                padding: "6px 12px",
                marginBottom: "6px",
                borderRadius: "4px",
                backgroundColor: player.id === currentPlayerId ? "#a0e7ff" : "#f5f5f5",
                fontWeight: player.id === currentPlayerId ? "bold" : "normal",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.1em", color: "#333" }}>
                    {player.id === currentPlayerId && "ᐅ "} 
                    {player.id === myPlayerId && "★ ME "} 
                    {player.name}
                </span>
                <span style={{ fontSize: "1.2em"}}>スコア: {player.score}</span>
            </div>

            {/* リソース */}
            {player.resources?.length > 0 && (
                <div style={{ marginTop: "4px", marginBottom: "8px", fontSize: "0.9em", color: "#333" }}>
                    <strong style={{ display: "block", marginBottom: "4px"}}>リソース:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {player.resources.map((resource) => (
                            <span 
                                key={resource.id} 
                                title={resource.name}
                                style={{ 
                                    padding: "4px 8px", 
                                    backgroundColor: "#f0f0f0", 
                                    borderRadius: "4px",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {resource.icon} {resource.name}: {resource.currentValue} / {resource.maxValue}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            {/* トークン */}
            {player.tokens?.length > 0 && (
                <TokenDisplayContent 
                    tokens={player.tokens} 
                    socket={socket} 
                    roomId={roomId}
                    myPlayerId={myPlayerId} 
                    playerIdBeingDisplayed={player.id} 
                />
            )}

            {/* カード */}
            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                {player.cards.map((card) => {
                    const isFaceUp = !!card.isFaceUp && player.id === myPlayerId;
                    const isSelected = selectedCards.includes(card.id);

                    return (
                        <div
                            key={card.id}
                            className={isFaceUp ? styles.card : styles.cardBack}
                            style={{
                                position: "relative",
                                cursor: isFaceUp ? "pointer" : "default",
                                backgroundColor: isFaceUp ? undefined : card.backColor, 
                                border: isSelected ? "2px solid gold" : "none",
                                boxSizing: "border-box",
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                            }}
                            onClick={() => toggleCardSelection(card.id, isFaceUp)}
                        >
                            <CardDisplayContent card={card} isFaceUp={isFaceUp} />
                            {isFaceUp && card.description && (
                                <span className={styles.tooltip}>{card.description}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </li>
    );
});

// =========================================================================
// メインコンポーネント
// =========================================================================
type ScoreboardProps = {
    socket: Socket;
    players: PlayerWithResources[];
    currentPlayerId?: PlayerId | null;
    myPlayerId: PlayerId | null;
    roomId: RoomId;
    backColor?: string;
};

export default function ScoreBoard({
    socket,
    players,
    currentPlayerId,
    myPlayerId,
    roomId,
    backColor = "#000000ff",
}: ScoreboardProps) {
    
    const displayedPlayers: DisplayedPlayer[] = React.useMemo(() => {
        return (players || []).map((p) => ({
            ...p,
            score: p.score ?? 0,
            cards: p.cards ?? [],
            resources: p.resources ?? [],
            tokens: p.tokens ?? [],
        }));
    }, [players]);

    const [selectedCards, setSelectedCards] = React.useState<string[]>([]);

    const toggleCardSelection = React.useCallback((cardId: string, isFaceUp: boolean) => {
        if (!isFaceUp) return;
        setSelectedCards((prev) =>
            prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
        );
    }, []);

    const playSelectedCards = React.useCallback(() => {
        if (selectedCards.length === 0 || !myPlayerId) return;

        const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
        if (!myPlayer) return;

        const cardsByDeck: Record<string, string[]> = {};
        let targetPlayLocation: string | undefined;

        selectedCards.forEach((cardId) => {
            const card = myPlayer.cards.find((c) => c.id === cardId);
            if (!card) return;
            
            if (!targetPlayLocation) {
                targetPlayLocation = card.playLocation as string; 
            }
            
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

        setSelectedCards([]);
    }, [selectedCards, myPlayerId, displayedPlayers, socket, roomId]);

    const nextTurn = React.useCallback(() => {
        socket.emit("game:next-turn", { roomId });
    }, [socket, roomId]);

    return (
        <div style={{ 
            padding: "16px", border: "1px solid #333", borderRadius: "12px", 
            backgroundColor: "#f9f9f9", maxWidth: "900px", margin: "0 auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
            <h2 style={{ fontSize: "1.5em", marginBottom: "12px", borderBottom: "2px solid #ddd", paddingBottom: "8px" }}>
                ゲームスコアボード
            </h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
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

            <div style={{ marginTop: "12px", display: "flex", gap: "6px" }}>
                <button onClick={playSelectedCards} disabled={selectedCards.length === 0}>
                    選択カードを出す
                </button>
                <button onClick={nextTurn}>次のターン</button>
            </div>
        </div>
    );
}
