// src/components/ScoreBoard.tsx (修正後)
import * as React from "react";
import { Socket } from "socket.io-client";
import { Player, PlayerId } from "../types/player.js";
// ⭐ 修正: Resource 型をインポート
import type { Resource } from "../types/resource.js";
import styles from "./Card.module.css";

// Player型はリソースを持つことを前提とする
type PlayerWithResources = Player & { resources: Resource[] };

type ScoreboardProps = {
  socket: Socket;
  players: PlayerWithResources[]; // ⭐ プレイヤー型をリソースを持つ型に修正
  currentPlayerId?: PlayerId | null;
  myPlayerId: PlayerId | null;
  backColor?: string;
};

export default function ScoreBoard({
  socket,
  players,
  currentPlayerId,
  myPlayerId,
  backColor = "#000000ff",
}: ScoreboardProps) {
  const nextTurn = () => socket.emit("game:next-turn");

  const [selectedCards, setSelectedCards] = React.useState<string[]>([]); // 同時出し用の選択カード

  // ⭐ 修正: displayedPlayersでresourcesも初期化
  const displayedPlayers = (players || []).map((p) => ({
    ...p,
    score: p.score ?? 0,
    cards: p.cards ?? [],
    resources: p.resources ?? [], // ⭐ リソースがnull/undefinedの場合に空配列を適用
  }));

  const toggleCardSelection = (cardId: string, isFaceUp: boolean) => {
    if (!isFaceUp) return;
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const playSelectedCards = () => {
    if (selectedCards.length === 0 || !myPlayerId) return;

    const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
    if (!myPlayer) return;

    // 選択カードをデッキごとにグループ化
    const cardsByDeck: Record<string, string[]> = {};
    selectedCards.forEach((cardId) => {
      const card = myPlayer.cards.find((c) => c.id === cardId);
      if (!card) return;
      if (!cardsByDeck[card.deckId]) cardsByDeck[card.deckId] = [];
      cardsByDeck[card.deckId].push(card.id);
    });

    // デッキごとにサーバーへ送信
    Object.entries(cardsByDeck).forEach(([deckId, cardIds]) => {
      socket.emit("card:play", {
        deckId,
        cardIds,       // そのデッキ内の複数カード
        playerId: myPlayerId,
        playLocation: "field",
      });
    });

    setSelectedCards([]); // 選択解除
  };

  return (
    <div style={{ padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Scoreboard</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {displayedPlayers.map((player) => (
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{player.id === myPlayerId && "⭐️"} {player.name}</span>
              <span>スコア: {player.score}</span>
            </div>

            {/* ⭐ リソース表示エリアの修正 */}
            {player.resources && player.resources.length > 0 && (
              <div style={{ 
                // ⭐ 修正: flexを削除し、縦に並ぶようにする
                display: "block", 
                // gap: "12px", // 削除またはコメントアウト
                marginTop: "4px", 
                marginBottom: "8px", 
                fontSize: "0.9em", 
                color: "#333" 
              }}>
                {player.resources.map((resource) => (
                  <div 
                    key={resource.id} 
                    title={resource.name}
                    style={{ marginBottom: "2px" }} // ⭐ 追加: 項目間に隙間を設ける
                  >
                    {/* アイコン、名前、現在値/最大値を表示 */}
                    {resource.icon} {resource.name}: {resource.currentValue} / {resource.maxValue}
                  </div>
                ))}
              </div>
            )}
            
            {/* ... カードの表示ロジック（省略） */}
            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
              {player.cards.map((card) => {
                const isFaceUp: boolean = !!card.isFaceUp && player.id === myPlayerId;
                const isSelected = selectedCards.includes(card.id);

                return (
                  <div
                    key={card.id}
                    className={isFaceUp ? styles.card : styles.cardBack}
                    style={{
                      position: "relative",
                      cursor: isFaceUp ? "pointer" : "default",
                      width: "60px",
                      height: "80px",
                      backgroundColor: isFaceUp ? undefined : card.backColor,
                      border: isSelected ? "2px solid gold" : "none",
                      boxSizing: "border-box",
                    }}
                    onClick={() => toggleCardSelection(card.id, isFaceUp)}
                  >
                    {isFaceUp && card.name}
                    {isFaceUp && card.description && (
                      <span className={styles.tooltip}>{card.description}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </li>
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