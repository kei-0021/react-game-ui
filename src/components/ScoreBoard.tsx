import * as React from "react";
import { Socket } from "socket.io-client";
import { Card } from "../types/card.js";
import { PlayerId } from "../types/definition.js";
import { PlayerWithResources } from "../types/playerWithResources.js";
import type { Resource } from "../types/resource.js";
import { Token } from "../types/token.js";
import styles from "./Card.module.css";

// =========================================================================
// ⭐ NEW: カード表面の内容をレンダリングするヘルパーコンポーネント (React.memoでラップ)
// =========================================================================
const CardDisplayContent = React.memo(({ card, isFaceUp }: { card: Card, isFaceUp: boolean }) => {
    if (!isFaceUp) {
      return null; // 裏向きなら何も表示しない
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
});

// === トークン表示用のインラインコンポーネント (TokenDisplayの機能を簡易化) (React.memoでラップ) ===
const TokenDisplayContent = React.memo(({ tokens, socket, myPlayerId, playerIdBeingDisplayed } : { 
    tokens?: Token[], 
    socket: Socket, 
    myPlayerId: PlayerId | null,
    playerIdBeingDisplayed: PlayerId
}) => {
    // 自分のトークンかどうかを判定し、クリック可能にする
    const isMyToken = myPlayerId === playerIdBeingDisplayed;

    if (!tokens || tokens.length === 0) return null;
    
    // トークンリストのレンダリング
    return (
        <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #ddd',
        }}>
            {/* トークンが存在するもののみをフィルタリングして表示 */}
            {tokens.map(token => { 
              return (
                <div 
                    key={token.id} 
                    title={`クリックして再獲得: ${token.name}`}
                    style={{ 
                        // ⭐ 丸型表示のためのスタイル変更
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#ffffffff',
                        borderRadius: '50%', // 円形にする
                        width: '48px', // サイズを固定
                        height: '48px', // サイズを固定
                        fontSize: '0.75em',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        lineHeight: '1.1',
                        
                        // その他のスタイル
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)', // 影を強化
                        cursor: isMyToken ? 'pointer' : 'default', // 自分のトークンのみカーソルを変更
                        opacity: isMyToken ? 1 : 0.7, // 他のプレイヤーのトークンは少し暗くする
                        flexShrink: 0,
                        wordBreak: 'break-word', // 長い名前の折り返し
                        padding: '2px',
                    }}
                >
                    {/* トークン名を中央に直接表示 */}
                    {token.name}
                </div>
              );
            })}
        </div>
    );
});
// =========================================================================

// Player型はリソースを持つことを前提とする
type DisplayedPlayer = PlayerWithResources & { score: number, cards: Card[], resources: Resource[], tokens: Token[] };

type ScoreboardProps = {
    socket: Socket;
    players: PlayerWithResources[]; // プレイヤー型をリソースを持つ型に修正
    currentPlayerId?: PlayerId | null;
    myPlayerId: PlayerId | null;
    backColor?: string;
};

// =========================================================================
// ⭐ プレイヤーリストアイテムをメモ化するコンポーネント
// =========================================================================
type PlayerListItemProps = {
    player: DisplayedPlayer;
    currentPlayerId: PlayerId | null | undefined;
    myPlayerId: PlayerId | null;
    selectedCards: string[];
    toggleCardSelection: (cardId: string, isFaceUp: boolean) => void;
    socket: Socket;
};

// プレイヤーデータが変更されない限り再レンダリングしない
const PlayerListItem = React.memo(({
    player,
    currentPlayerId,
    myPlayerId,
    selectedCards,
    toggleCardSelection,
    socket,
}: PlayerListItemProps) => {

    // カードとリソースのレンダリングもMemo化して再計算を削減可能だが、今回はItem全体をMemo化
    
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

            {/* リソース表示エリアの修正 */}
            {player.resources && player.resources.length > 0 && (
                <div style={{ 
                    display: "block", 
                    marginTop: "4px", 
                    marginBottom: "8px", 
                    fontSize: "0.9em", 
                    color: "#333" 
                }}>
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
            
            {/* トークン表示 */}
            {player.tokens && player.tokens.length > 0 && (
                <TokenDisplayContent 
                    tokens={player.tokens} 
                    socket={socket} 
                    myPlayerId={myPlayerId} 
                    playerIdBeingDisplayed={player.id} 
                />
            )}

            {/* カードの表示ロジック（画像表示を適用） */}
            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                {player.cards.map((card) => {
                    // 自分のカードのみ表、そうでなければ裏
                    const isFaceUp: boolean = !!card.isFaceUp && player.id === myPlayerId;
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
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onClick={() => toggleCardSelection(card.id, isFaceUp)}
                        >
                            <CardDisplayContent card={card} isFaceUp={isFaceUp} />
                            
                            {/* ツールチップはそのまま残す */}
                            {isFaceUp && card.description && (
                                <span className={styles.tooltip}>{card.description}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </li>
    );
}, (prevProps, nextProps) => {
    // 複雑なオブジェクト比較は避ける。ここでは、playerオブジェクト自体が不変であればOKとする。
    // player、selectedCards配列、myPlayerId、currentPlayerIdの参照が全て同じなら再レンダリングしない
    // ただし、selectedCardsはStateなので変更されると参照が変わる
    return (
        prevProps.player === nextProps.player &&
        prevProps.selectedCards === nextProps.selectedCards &&
        prevProps.myPlayerId === nextProps.myPlayerId &&
        prevProps.currentPlayerId === nextProps.currentPlayerId
    );
});


// =========================================================================
// ⭐ メインコンポーネント
// =========================================================================
export default function ScoreBoard({
    socket,
    players,
    currentPlayerId,
    myPlayerId,
    backColor = "#000000ff",
}: ScoreboardProps) {
    
    // ⭐ UseMemoを使用して、playersプロップスが変更されたときのみ displayedPlayers を再計算
    const displayedPlayers: DisplayedPlayer[] = React.useMemo(() => {
        return (players || []).map((p) => ({
            ...p,
            score: p.score ?? 0,
            cards: p.cards ?? [],
            resources: p.resources ?? [],
            tokens: p.tokens ?? [],
        }));
    }, [players]); // players配列の参照が変更されたときのみ実行

    const [selectedCards, setSelectedCards] = React.useState<string[]>([]); // 同時出し用の選択カード

    const toggleCardSelection = React.useCallback((cardId: string, isFaceUp: boolean) => {
        if (!isFaceUp) return;
        setSelectedCards((prev) =>
            prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
        );
    }, []); // 依存配列は空でOK

    const playSelectedCards = React.useCallback(() => {
        if (selectedCards.length === 0 || !myPlayerId) return;

        const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
        if (!myPlayer) return;

        const cardsByDeck: Record<string, string[]> = {};
        let targetPlayLocation: string | undefined;

        selectedCards.forEach((cardId) => {
            // @ts-ignore
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
                deckId,
                cardIds,       // そのデッキ内の複数カード
                playerId: myPlayerId,
                playLocation: targetPlayLocation, 
            });
        });

        setSelectedCards([]); // 選択解除
    }, [selectedCards, myPlayerId, displayedPlayers, socket]); // 依存配列にStateとPropsを追加

    // nextTurn関数も useCallback でメモ化
    const nextTurn = React.useCallback(() => socket.emit("game:next-turn"), [socket]);

    return (
        <div style={{ 
            padding: "16px", 
            border: "1px solid #333", 
            borderRadius: "12px", 
            backgroundColor: "#f9f9f9",
            maxWidth: "900px",
            margin: "0 auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
            <h2 style={{ fontSize: "1.5em", marginBottom: "12px", borderBottom: "2px solid #ddd", paddingBottom: "8px" }}>
                ゲームスコアボード
            </h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {/* PlayerListItemコンポーネントを使用してレンダリング */}
                {displayedPlayers.map((player) => (
                    <PlayerListItem
                        key={player.id}
                        player={player}
                        currentPlayerId={currentPlayerId}
                        myPlayerId={myPlayerId}
                        selectedCards={selectedCards}
                        toggleCardSelection={toggleCardSelection}
                        socket={socket}
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
