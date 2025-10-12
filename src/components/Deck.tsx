import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card, DeckId } from "../types/card.js";
import { PlayerId } from "../types/player.js";
import styles from "./Card.module.css";

type DeckProps = {
  socket: Socket;
  deckId: DeckId;
  name: string;
  playerId?: PlayerId | null;
};

// サーバーから受信するデータ型を拡張
type DeckUpdateData = { 
  currentDeck: Card[], 
  drawnCards: Card[], 
  discardPile: Card[] 
};


export default function Deck({ socket, deckId, name, playerId = null}: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = React.useState<Card[]>([]);
  // 捨て札（Discard Pile）の状態を管理
  const [discardPile, setDiscardPile] = React.useState<Card[]>([]); 

  React.useEffect(() => {
    // デッキ初期化イベント購読
    socket.on(`deck:init:${deckId}`, (data: DeckUpdateData) => {
      setDeckCards(data.currentDeck.map(c => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map(c => ({ ...c, deckId })));
      setDiscardPile(data.discardPile.map(c => ({ ...c, deckId }))); 
    });

    // デッキ更新イベント購読
    socket.on(`deck:update:${deckId}`, (data: DeckUpdateData) => {
      console.log("drawnCards:", data.drawnCards); 
      console.log(`[Deck Update] discardPile:`, data.discardPile); 

      setDeckCards(data.currentDeck.map(c => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map(c => ({ ...c, deckId })));
      // 捨て札の状態を更新
      setDiscardPile(data.discardPile.map(c => ({ ...c, deckId })));
    });

    return () => {
      socket.off(`deck:init:${deckId}`);
      socket.off(`deck:update:${deckId}`);
    };
  }, [socket, deckId]);

  const draw = () => {
    if (deckCards.length === 0) return;
    socket.emit("deck:draw", { deckId, playerId });
  };

  const shuffle = () => socket.emit("deck:shuffle", { deckId });
  const resetDeck = () => socket.emit("deck:reset", { deckId });

  return (
    <section className={styles.deckSection}>
      {/* デッキ名 */}
      <h3 style={{ marginBottom: "6px" }}>{name}</h3>

      <div className={styles.deckControls}>
        <button onClick={shuffle}>シャッフル</button>
        <button onClick={resetDeck}>山札に戻す</button>
      </div>

      {/* カードコンテナを横に並べる (間隔0で隣接) */}
      <div 
          className={styles.deckWrapper} 
          style={{ display: 'flex', gap: '0px' }} 
      >
        
        {/* 1. 山札コンテナ */}
        <div className={styles.deckContainer} onClick={draw}>
          {deckCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCard}
              style={{ 
                zIndex: deckCards.length - i, 
                // カードの重ね具合を調整
                transform: `translate(${i * 0.3}px, ${i * 0.3}px)` , 
                backgroundColor: c.backColor,
              }}
            />
          ))}
        </div>

        {/* 2. ドロー済みカードコンテナ */}
        <div className={styles.deckContainer}>
          {drawnCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCardFront}
              style={{ zIndex: i + 1, transform: `translate(${i * 0.3}px, ${i * 0.3}px)` }}
            >
              {c.isFaceUp && c.name}
            </div>
          ))}
        </div>
        
        {/* 3. 捨て札置き場コンテナ */}
        <div className={styles.deckContainer} style={{ border: '1px solid #777', backgroundColor: '#e0e0e0' }}> 
          {discardPile.length > 0 && ( // 捨て札がある場合のみ表示
            // 捨て札の山の一番上を表向きで表示
            <div
              key={discardPile[discardPile.length - 1].id}
              className={styles.deckCardFront} 
              style={{ 
                  zIndex: 1, 
                  backgroundColor: 'white', 
                  borderColor: '#aaa',
                  display: 'flex',
                  flexDirection: 'column',
                  // ⭐ 修正: コンテンツを垂直方向の中央に寄せる
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '5px',
                  position: 'relative', // 内部の絶対配置の基準
              }}
            >
              {/* カード名 (中央配置) */}
              <strong style={{ fontSize: '1em', wordBreak: 'break-all', flexGrow: 1, 
                  // ⭐ 修正: テキストを垂直方向にも中央に配置
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px' // 合計枚数との隙間
              }}>
                  {discardPile[discardPile.length - 1].name}
              </strong>
            </div>
          )}
        </div>
        
      </div>
    </section>
  );
}
