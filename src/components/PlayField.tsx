// src/components/PlayField.tsx (roomId対応版)

import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card } from "../types/card.js";
import type { DeckId, RoomId } from "../types/definition.js";
// 💡 追加: プレイヤーの型情報をインポート
import type { PlayerWithResources } from "../types/playerWithResources.js";
import { client_log } from "../utils/client-log.js";
import styles from "./Card.module.css";

// =========================================================================
// カード表面の内容をレンダリングするコンポーネント
// =========================================================================
const CardDisplayContent = ({ card, isFaceUp }: { card: Card; isFaceUp: boolean }) => {
// ... (変更なし) ...
  if (!isFaceUp) {
    console.log(`[CardDisplayContent] Card ID: ${card.id}, Name: ${card.name} - isFaceUp is false. Not rendering.`);
    return null;
  }

  if (card.frontImage) {
    console.log(`[CardDisplayContent] Card ID: ${card.id}, Name: ${card.name} - Rendering with frontImage: ${card.frontImage}`);
    return (
      <img
        src={card.frontImage}
        alt={card.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    );
  }

  console.log(`[CardDisplayContent] Card ID: ${card.id}, Name: ${card.name} - Rendering with card.name (No frontImage).`);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        padding: "5px",
        color: "#333",
      }}
    >
      <strong style={{ fontSize: "0.8em", wordBreak: "break-all", textAlign: "center" }}>
        {card.name}
      </strong>
    </div>
  );
};

// =========================================================================
// PlayField コンポーネント
// =========================================================================
type PlayFieldProps = {
  socket: Socket;
  roomId: RoomId;
  deckId: DeckId;
  name: string;
  is_logging?: boolean;
  // 💡 追加: プレイヤーリストを受け取る (名前表示のために必要)
  players: PlayerWithResources[]; 
  // 💡 追加: 自分のプレイヤーIDを受け取る
  myPlayerId: string | null;
};

export default function PlayField({
  socket,
  roomId,
  deckId,
  name,
  is_logging = false,
  players, // Propsからplayersを取得
  myPlayerId, // 💡 PropsからmyPlayerIdを取得
}: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);

  React.useEffect(() => {
    const handleUpdate = (data: { playFieldCards?: Card[] }) => {
      const newCards = data.playFieldCards || [];

      if (is_logging) {
        client_log("playField", `[${deckId}] 場の状態を更新`);
        client_log("playField", `[${deckId}] 古いカード数: ${playedCards.length}, 新しいカード数: ${newCards.length}`);
        client_log("playField", `[${deckId}] 受信したカードリスト:`, newCards.map((c) => c.name));
      }

      // 新しいカードリストが取得されたことをログ
      console.log(`[PlayField] Deck ${deckId} - Received ${newCards.length} cards for rendering.`);

      setPlayedCards(newCards);
    };

    // ⭐ roomIdを含めたイベント購読
    socket.on(`deck:update:${roomId}:${deckId}`, handleUpdate);

    return () => {
      socket.off(`deck:update:${roomId}:${deckId}`, handleUpdate);
    };
  }, [socket, roomId, deckId, playedCards.length]); // playedCards.length を追加して依存関係を正確に

  // ⭐ roomId付きで手札に戻す
  const returnCardToOwnerHand = (card: Card) => {
    if (!card.ownerId) {
      client_log("playField", `警告: ${card.name} には所有者IDが設定されていません。手札に戻せません。`);
      return;
    }

    socket.emit("card:return-to-hand", {
      roomId,
      deckId: card.deckId,
      cardId: card.id,
      targetPlayerId: card.ownerId,
    });

    client_log("playField", `カード ${card.name} を持ち主 ${card.ownerId} の手札に戻すようリクエスト`);
  };

  // 描画されるカードのリストを確認
  console.log(`[PlayField] Deck ${deckId} - Start rendering ${playedCards.length} cards in the Play Area.`);


  // 💡 関数: プレイヤーIDから色を取得する (カスタムロジックを適用)
  // 💡 修正: ownerIdの型を string | null | undefined に変更
  const getPlayerColor = (ownerId: string | null | undefined): string => {
    if (!ownerId) return '#aaaaaa'; // 所有者不明/null の場合は灰色
    
    // 💡 修正: ownerIdが自分のIDと一致するかで色を分岐
    if (ownerId === myPlayerId) {
        return '#4fc3f7'; // 自分自身のカード: 明るい青
    } else {
        return '#242a2aff'; // 他のプレイヤーのカード: 暗い黒っぽい色
    }
  };
  

  return (
    <section
      style={{
        border: "2px dashed #ccc",
        borderRadius: "10px",
        padding: "12px",
        background: "#fafafa",
      }}
    >
      <h3 style={{ marginBottom: "8px" }}>
        プレイエリア
        {name && (
          <span
            style={{
              marginLeft: "10px",
              fontWeight: "normal",
              fontSize: "0.9em",
              color: "#666",
            }}
          >
            （{name}）
          </span>
        )}
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "120px" }}>
        {playedCards.length === 0 && <div style={{ opacity: 0.6 }}>（まだカードが出ていません）</div>}
        {playedCards.map((card) => {
          const isFaceUp = true;
          const ownerColor = getPlayerColor(card.ownerId); // 所有者IDから色を取得
          
          // 💡 改善: ownerオブジェクトを先に取得し、名前やIDが存在しない場合に備える
          const owner = card.ownerId ? players.find(p => p.id === card.ownerId) : null;
          // 💡 修正: .toUpperCase() を削除し、大文字・小文字を維持する
          const ownerNameInitial = owner?.name?.[0] || '?'; 

          // 個々のカードレンダリングのログ
          console.log(`[PlayField] Deck ${deckId} - Rendering Card ID: ${card.id}, Name: ${card.name} (Owner: ${card.ownerId}, Color: ${ownerColor})`);

          return (
            <div
              key={card.id}
              className={styles.card}
              style={{
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // 💡 relative を確保（すでに存在）
              }}
              onDoubleClick={() => returnCardToOwnerHand(card)}
            >
              <CardDisplayContent card={card} isFaceUp={isFaceUp} />
              
              {/* 💡 所有者アイコンの追加 (ownerIdがない場合は非表示) */}
              {card.ownerId && (
                <div
                  // ツールチップにフルネームを表示するために players リストが必要
                  title={`所有者: ${owner?.name || '不明'}`} 
                  style={{
                    position: 'absolute',
                    top: '-5px', // 右上角より少し外側
                    right: '-5px', // 右上角より少し外側
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: ownerColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'white',
                    border: '2px solid white', // カードの背景色との対比を強調
                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
                    zIndex: 10,
                  }}
                >
                  {ownerNameInitial}
                </div>
              )}

              {card.description && <span className={styles.tooltip}>{card.description}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
