// src/components/Deck.tsx (最終修正版 - ツールチップ表示をReactで制御)
import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card, } from "../types/card.js";
import { CardLocation } from "../types/cardLocation.js";
import type { DeckId, PlayerId } from "../types/definition.js";
import styles from "./Card.module.css";

type DeckProps = {
  socket: Socket;
  deckId: DeckId;
  name: string;
  playerId?: PlayerId | null;
};

// サーバーから受信するデータ型
type DeckUpdateData = { 
  currentDeck: Card[], 
  drawnCards: Card[], 
  discardPile: Card[] 
};

// =========================================================================
// ⭐ ヘルパーコンポーネント: カード表面の内容をレンダリング
// =========================================================================
  const CardContent = ({ card }: { card: Card }) => {
    if (!card.isFaceUp) {
      return null; // 裏向きなら何も表示しない
    }

    // PNG画像パスが存在する場合
    if (card.frontImage) {
      return (
        <img 
          src={card.frontImage} 
          alt={card.name} 
          // <img>が親の要素全体を使うように設定
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain' // 画像をコンテナ内に収める
          }} 
        />
      );
    }else{
      console.log(`[CardContent] pngの描画失敗" ${card.id}. Path: ${card.frontImage}`)
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
    }}>
        <strong style={{ fontSize: '1em', wordBreak: 'break-all', textAlign: 'center' }}>
            {card.name}
        </strong>
    </div>
  );
};

// =========================================================================
// Deck コンポーネント本体
// =========================================================================
export default function Deck({ socket, deckId, name, playerId = null}: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = React.useState<Card[]>([]);
  const [discardPile, setDiscardPile] = React.useState<Card[]>([]); 
  
  // ⭐ ⭐ ⭐ 追加: 捨て札カードのホバー状態を管理する state ⭐ ⭐ ⭐
  const [isDiscardHovered, setIsDiscardHovered] = React.useState(false);

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

    const cardToDraw = deckCards[0];
    const drawLocation = cardToDraw?.drawLocation || "hand"; 

    // ⭐ [修正点] drawLocation に応じて playerId を含めるか判断する
    const requestData: { deckId: DeckId; playerId?: PlayerId | null; drawLocation: CardLocation } = {
        deckId, 
        drawLocation,
    };

    if (drawLocation === "hand" && playerId) {
        // 手札に引く場合のみ playerId を含める
        requestData.playerId = playerId;
    }
    // "field" に引く場合は playerId を含めない

    // サーバーにイベントを送信
    socket.emit("deck:draw", requestData);
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

        {/* 2. ドロー済みカードコンテナ (CardContentで画像/テキストを自動切替) */}
        <div className={styles.deckContainer}>
          {drawnCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCardFront}
              style={{ zIndex: i + 1, transform: `translate(${i * 0.3}px, ${i * 0.3}px)` }}
            >
              {/* CardContentを使用 */}
              <CardContent card={c} /> 
            </div>
          ))}
        </div>
        
        {/* 3. 捨て札置き場コンテナ */}
        <div className={`${styles.deckContainer} ${styles.discardPileWrapper}`}> 
          {discardPile.length > 0 && (() => {
            const topCard = discardPile[discardPile.length - 1];
            return (
              // 捨て札の山の一番上を表向きで表示
              <div
                key={topCard.id}
                className={`${styles.deckCardFront} ${styles.discardTopCard}`} 
                style={{ 
                    // インラインで pointerEvents を強制
                    pointerEvents: 'auto', 
                }}
                // ⭐ ⭐ ⭐ 追加: マウスイベントでホバー状態を更新 ⭐ ⭐ ⭐
                onMouseEnter={() => setIsDiscardHovered(true)}
                onMouseLeave={() => setIsDiscardHovered(false)}
              >
                {/* CardContentを使用 */}
                <CardContent card={topCard} />
                
                {/* ツールチップを表示 */}
                {topCard.description && (
                  <span 
                    className={styles.tooltip}
                    style={{
                      // ⭐ ⭐ ⭐ state に基づいて表示/非表示をインラインで強制制御 ⭐ ⭐ ⭐
                      visibility: isDiscardHovered ? 'visible' : 'hidden',
                      opacity: isDiscardHovered ? 1 : 0,
                      zIndex: 9999, // 最前面に表示
                    }}
                  >
                    {topCard.description}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
        
      </div>
    </section>
  );
}