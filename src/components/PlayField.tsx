import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card } from "../types/card.js";
import { client_log } from "../utils/client-log.js";
// ⭐ 1. Card.module.css のインポートを追加
import styles from "./Card.module.css";

// =========================================================================
// ⭐ NEW: カード表面の内容をレンダリングするヘルパーコンポーネントを再定義
// =========================================================================
const CardDisplayContent = ({ card, isFaceUp }: { card: Card, isFaceUp: boolean }) => {
  if (!isFaceUp) {
    return null; // 裏向きなら何も表示しない (PlayFieldでは常にFaceUpだが念のため)
  }

  // PNG画像パスが存在する場合
  if (card.frontImage) {
    return (
      <img 
        src={card.frontImage} 
        alt={card.name} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain' // 画像をコンテナ内に収める
        }} 
      />
    );
  }

  // 従来のカード名表示の場合 (画像パスが存在しない場合)
  return (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        width: '100%',
        padding: '5px',
        color: '#333', // カードの文字色
    }}>
        <strong style={{ fontSize: '0.8em', wordBreak: 'break-all', textAlign: 'center' }}>
            {card.name}
        </strong>
    </div>
  );
};
// =========================================================================

type PlayFieldProps = {
  socket: Socket;
  deckId: string;
  name: string;
  is_logging?: boolean;
};

export default function PlayField({ socket, deckId, name, is_logging = false }: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);

  React.useEffect(() => {
    const handleUpdate = (data: {
      playFieldCards?: Card[];
    }) => {
      const newCards = data.playFieldCards || [];

      if (is_logging) {
        client_log("playField", `[${deckId}] 場の状態を更新`);
        client_log("playField", `[${deckId}] 古いカード数: ${playedCards.length}, 新しいカード数: ${newCards.length}`);
        client_log("playField", `[${deckId}] 受信したカードリスト:`, newCards.map(c => c.name)); 
      }
      
      setPlayedCards(data.playFieldCards || []);
    };

    socket.on(`deck:update:${deckId}`, handleUpdate);

    return () => {
      socket.off(`deck:update:${deckId}`, handleUpdate);
    };
  }, [socket, deckId]);

  const playCard = (card: Card) => {
    socket.emit("card:play", {
      deckId: card.deckId,
      cardId: card.id,
      playLocation: "field",
    });
  };

  return (
    <section style={{ border: "2px dashed #ccc", borderRadius: "10px", padding: "12px", margin: "12px 0", background: "#fafafa" }}>
      <h3 style={{ marginBottom: "8px" }}>
        プレイエリア 
        {name && <span style={{ marginLeft: "10px", fontWeight: "normal", fontSize: "0.9em", color: "#666" }}>（{name}）</span>}
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "120px" }}>
        {playedCards.length === 0 && <div style={{ opacity: 0.6 }}>（まだカードが出ていません）</div>}
        {playedCards.map((card) => {
            const isFaceUp = true; // プレイ済みカードは常に表向きにする
            return (
                <div
                key={card.id}
                // ⭐ 2. styles.card クラスを適用し、インラインスタイルを削除
                className={styles.card}
                style={{
                    // width: "80px",  <-- 削除
                    // height: "120px", <-- 削除
                    // border: "1px solid #999", <-- 削除
                    // borderRadius: "6px", <-- 削除
                    // background: "white", <-- 削除
                    // boxShadow: "2px 2px 4px rgba(0,0,0,0.1)", <-- 削除
                    cursor: "pointer",
                    position: "relative",
                    // スタイルは Card.module.css に任せ、配置のためのインラインスタイルのみ残す
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                // ⭐ 3. Reactによるツールチップのインライン表示/非表示ロジックを削除
                // onMouseEnter={e => { ... }}
                // onMouseLeave={e => { ... }}
                >
                {/* ⭐ 修正: CardDisplayContent を使用して画像または名前を表示 */}
                <CardDisplayContent card={card} isFaceUp={isFaceUp} />
                
                {card.description && (
                    <span
                    // ⭐ 4. styles.tooltip クラスを適用
                    className={styles.tooltip}
                    >
                    {card.description}
                    </span>
                )}
                </div>
            );
            })}
      </div>
    </section>
  );
}
