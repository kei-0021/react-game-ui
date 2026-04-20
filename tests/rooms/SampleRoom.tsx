// src/rooms/SampleRoom.tsx
// PlayField上のカードの動作確認
// ドラッグ可能オブジェクトの動作確認
// ダイスの動作確認

/// <reference types="vite/client" />
import { DiceUpdateData } from '@/types/socketData';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ComponentInfo,
  Deck,
  Dice,
  Draggable,
  GameTurnUpdateData,
  Player,
  PlayerId,
  PlayField,
  RemoteCursor,
  RoomJoinData,
  ScoreBoard,
  Timer,
  useSocket,
} from 'react-game-ui';
import { useParams } from 'react-router-dom';
import './SampleRoom.css';

const SERVER_URL = 'http://127.0.0.1:4000';
const DRAGGABLE_IMAGE_PATH = '/hanabishi.svg';

export function SampleRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);

  const [userName, setUserName] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const [componentInfo, setComponentInfo] = useState<ComponentInfo[]>([]);

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);

  const [currentValue, setCurrentValue] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  const GAME_ID = 'sample';

  const handleJoinRoom = useCallback(() => {
    if (!socket || !roomId || userName.trim() === '' || isJoining) return;

    setIsJoining(true);
    socket.emit('room:join', {
      roomId,
      gameId: GAME_ID,
      playerName: userName.trim(),
    } as RoomJoinData);
  }, [socket, roomId, userName, isJoining]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleGameComponent = (data: { components: ComponentInfo[] }) => {
      setComponentInfo(data.components);
    };

    const onClientReady = (id: PlayerId) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
      socket.emit('client:ready', roomId);
    };

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    };

    const handleDiceUpdate = (data: DiceUpdateData) => {
      setCurrentValue(data.value);
    };

    const handleGameTurn = (data: GameTurnUpdateData) => {
      {
        setCurrentPlayerId(data.currentPlayerId);
        setCurrentRound(data.currentRoundIndex);
      }
    };

    socket.on('client:ready-to-sync', onClientReady);
    socket.on('game:component', handleGameComponent);
    socket.on('players:update', handlePlayersUpdate);
    socket.on('dice:update', handleDiceUpdate);
    socket.on('game:turn', handleGameTurn);

    return () => {
      socket.off('client:ready-to-sync', onClientReady);
      socket.off('room_init_success', handleGameComponent);
      socket.off('players:update', handlePlayersUpdate);
      socket.off('game:turn', handleGameTurn);
    };
  }, [socket, roomId]);

  if (!roomId) return <p>⚠️ ルームIDがURLから取得できません</p>;
  if (!socket) return <p>サーバーに接続中...</p>;

  if (!hasJoined) {
    return (
      <div className="input-form">
        <h2>ルーム参加</h2>
        <input
          type="text"
          placeholder="名前を入力"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={isJoining}
          onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
          autoFocus
        />
        <button onClick={handleJoinRoom} disabled={userName.trim() === '' || isJoining}>
          {isJoining ? '参加中...' : 'ルームに参加'}
        </button>
      </div>
    );
  }

  return (
    <div className="room-container" ref={containerRef}>
      <h1>Room ID: {roomId}</h1>
      <div className="round-display">ROUND: {currentRound}</div>
      <div>現在のダイスの目: {currentValue}</div>
      <ScoreBoard
        socket={socket}
        roomId={roomId}
        players={players}
        currentPlayerId={currentPlayerId}
        myPlayerId={myPlayerId}
        turnSkipButton={[true, true]}
      />

      <div style={{ display: 'flex', gap: '16px' }}>
        <Dice socket={socket} diceId="6面" roomId={roomId} title="6面ダイス" />
      </div>

      <Timer socket={socket} initialDuration={30} roomId={roomId}></Timer>
      <Deck
        socket={socket}
        roomId={roomId}
        deckId="numberDeck"
        title="数字カード"
        currentPlayerId={currentPlayerId}
        myPlayerId={myPlayerId}
      ></Deck>
      <PlayField
        socket={socket}
        roomId={roomId}
        deckId="numberDeck"
        title="数字カード"
        myPlayerId={myPlayerId}
        players={players}
        isDebug={true}
      />

      <Draggable
        socket={socket}
        roomId={roomId}
        draggableId="piece"
        image={DRAGGABLE_IMAGE_PATH}
        mask={true}
        containerRef={containerRef}
        color="red"
        size={100}
        isDebug={true}
      />
      {[...Array(10)].map((_, i) => (
        <Draggable
          socket={socket}
          roomId={roomId}
          draggableId={`piece-${i}`}
          size={{ width: 200, height: 100 }}
          containerRef={containerRef}
          isFrontOnDragging={true}
          color={`hsl(${200 + i * 5}, 70%, ${50 + i * 3}%)`}
          isDebug={true}
        >
          <div style={{ color: '#fff', fontWeight: 'bold' }}>Piece {i}</div>
        </Draggable>
      ))}

      <RemoteCursor
        socket={socket!}
        roomId={roomId}
        myPlayerId={myPlayerId}
        players={players.map((p) => ({
          name: p.name || 'Unknown',
          socketId: String(p.id),
          color: p.color,
        }))}
        scale={scale}
        fixedContainerRef={containerRef}
        visible={true}
        isRelative={true}
      />
    </div>
  );
}
