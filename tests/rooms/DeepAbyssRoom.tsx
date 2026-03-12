// tests/rooms/DeepAbyssRoom.tsx
// カードの動作確認
// トークンの動作確認
// ボードの動作確認
// スコアボードのボタンの動作確認
// システムメッセージの動作確認
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Deck } from '../../src/components/Deck';
import { PlayField } from '../../src/components/PlayField';
import { ScoreBoard } from '../../src/components/ScoreBoard';
import { SystemMessageWindow } from '../../src/components/systemMessageWindow';
import { TokenStore } from '../../src/components/TokenStore';
import { useSocket } from '../../src/hooks/useSocket';
import type { Player } from '../../src/types/player';
import type { GameTurnUpdateData, RoomJoinData } from '../../src/types/socketData';
import MyBoard from '../components/MyBoard';
import Popup from '../components/PopUp';
import './DeepAbyssRoom.css';

const SERVER_URL = 'http://127.0.0.1:4000';

const Z_INDX_CARD = 200;

interface PopupState {
  message: string;
  color: string;
  visible: boolean;
}

interface GameResult {
  message: string;
  rankings: {
    rank: number;
    name: string;
    score: number;
  }[];
  finalRound: number;
}

export function DeepAbyssRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);
  const navigate = useNavigate();
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [popup, setPopup] = useState<PopupState>({
    message: '',
    color: 'blue',
    visible: false,
  });

  const [userName, setUserName] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const showPopup = useCallback((message: string, color: string) => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
    setPopup({ message, color, visible: true });
    const newTimerId = setTimeout(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
      popupTimerRef.current = null;
    }, 2000);
    popupTimerRef.current = newTimerId;
  }, []);

  const GAME_PRESET_ID = 'deepabyss';

  const handleJoinRoom = useCallback(() => {
    if (!socket || !roomId || userName.trim() === '' || isJoining) return;
    setIsJoining(true);
    socket.emit('room:join', {
      roomId,
      gameId: GAME_PRESET_ID,
      playerName: userName.trim(),
    } as RoomJoinData);
  }, [socket, roomId, userName, isJoining]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleAssignId = (id: Player['id']) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
    };

    const onClientReady = () => {
      socket.emit('client:ready', roomId);
    };

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    };

    const handleGameTurn = (data: GameTurnUpdateData) => {
      setCurrentPlayerId(data.currentPlayerId);
      setCurrentRound(data.currentRoundIndex + 1);
    };

    const handleShowPopup = (data: { message: string; color: string }) => {
      showPopup(data.message, data.color);
    };

    const handleGameEnd = (result: GameResult) => {
      setGameResult(result);
    };

    socket.on('player:assign-id', handleAssignId);
    socket.on('client:ready-to-sync', onClientReady);
    socket.on('players:update', handlePlayersUpdate);
    socket.on('game:turn', handleGameTurn);
    socket.on('client:show-popup', handleShowPopup);
    socket.on('game:end', handleGameEnd);

    return () => {
      socket.off('player:assign-id', handleAssignId);
      socket.off('client:ready-to-sync', onClientReady);
      socket.off('players:update', handlePlayersUpdate);
      socket.off('game:turn', handleGameTurn);
      socket.off('client:show-popup', handleShowPopup);
      socket.off('game:end', handleGameEnd);
    };
  }, [socket, roomId, showPopup]);

  if (!roomId) return <div className="deepsea-container">Room ID Not Found</div>;
  if (!socket) return <div className="deepsea-container">Connecting...</div>;

  if (!hasJoined) {
    return (
      <div className="deepsea-container">
        <div className="join-form-wrapper">
          <h2 className="deepsea-title-center">ルーム参加</h2>
          <input
            className="join-form-input"
            type="text"
            placeholder="名前を入力"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            autoFocus={true}
          />
          <button className="join-form-button" onClick={handleJoinRoom} disabled={!userName.trim() || isJoining}>
            {isJoining ? '参加中...' : 'ルームに参加'}
          </button>
        </div>
      </div>
    );
  }

  // ゲーム本編
  return (
    <div className="deepsea-container" ref={containerRef}>
      {/* ゲーム終了リザルトモーダル */}
      {gameResult && (
        <div className="result-overlay">
          <div className="result-modal">
            <h2 className="result-header">MISSION COMPLETE</h2>
            <p className="result-message">{gameResult.message}</p>
            <div className="result-ranking-list">
              {gameResult.rankings.map((res) => (
                <div key={res.rank} className={`result-rank-card rank-${res.rank}`}>
                  <div className="rank-badge">{res.rank}</div>
                  <div className="player-info">
                    <span className="player-name">{res.name}</span>
                    <span className="player-score">
                      {res.score} <small>pts</small>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="result-exit-button" onClick={() => navigate('/')}>
              ロビーへ戻る
            </button>
          </div>
        </div>
      )}

      {/* 汎用通知ポップアップ */}
      <Popup visible={popup.visible} color={popup.color}>
        {popup.message}
      </Popup>

      <div className="deepabyss-header">
        <h1 className="deepsea-title-center">ディープ・アビス - Room ID: {roomId}</h1>
        <p className="deepsea-subtitle-center">
          深海を調査して眠れる資源を
          <strong style={{ color: '#8be9fd', fontSize: '1.2em', textShadow: '0 0 8px rgba(139, 233, 253, 0.6)' }}>
            5ラウンド
          </strong>
          以内に見つけ出せ！
        </p>
        {/* ラウンド表示 */}
        <div className="round-display-container">
          <div className="round-label">MISSION ROUND:</div>
          <div className="round-number">{currentRound}</div>
        </div>
      </div>

      {/* ボードラッパー */}
      <div className="board-wrapper">
        <MyBoard socket={socket} roomId={roomId} myPlayerId={myPlayerId} />
      </div>
      <SystemMessageWindow socket={socket} roomId={roomId} />

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TokenStore socket={socket} roomId={roomId} tokenStoreId="ARTIFACT" title="遺物トークン" />
        <TokenStore socket={socket} roomId={roomId} tokenStoreId="Hanabishi" title="花火師トークン" />
      </div>

      <div className="game-main-layout">
        {/* 左側グループ：デッキ列とフィールド列を横に並べる塊 */}
        <div className="game-left-group">
          {/* デッキカラム（縦並び） */}
          <div className="deck-column">
            <Deck
              socket={socket}
              roomId={roomId}
              deckId="deepAbyssAction"
              title="アクションカード"
              currentPlayerId={currentPlayerId}
              myPlayerId={myPlayerId}
            />
            <Deck
              socket={socket}
              roomId={roomId}
              deckId="deepAbyssSpecies"
              title="深海生物カード"
              currentPlayerId={currentPlayerId}
              myPlayerId={myPlayerId}
            />
          </div>

          {/* フィールドカラム（縦並び） */}
          <div className="field-column">
            <PlayField
              socket={socket}
              roomId={roomId}
              deckId="deepAbyssSpecies"
              players={players}
              myPlayerId={myPlayerId}
              layoutMode="grid"
            />
            <PlayField
              socket={socket}
              roomId={roomId}
              deckId="deepAbyssAction"
              title="アクションカード"
              myPlayerId={myPlayerId}
              players={players}
              backgroundImage="/gameboard.png"
              is_logging={true}
              baseZIndex={Z_INDX_CARD}
            />
          </div>
        </div>

        {/* スコアボード（一番右に配置） */}
        <div className="scoreboard-column">
          <ScoreBoard
            socket={socket}
            roomId={roomId}
            players={players}
            currentPlayerId={currentPlayerId}
            myPlayerId={myPlayerId}
            playCardLimit={2}
            isDebug={true}
            playCardButton={[true, true]}
            holdButton={[true, false]}
            flipButton={[true, true]}
            turnSkipButton={[true, true]}
            roundSkipButton={[true, false]}
            enabled={true}
          />
        </div>
      </div>
    </div>
  );
}
