/// <reference types="vite/client" />
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Deck } from '../../src/components/Deck';
import Dice from '../../src/components/Dice';
import { Draggable } from '../../src/components/Draggable';
import { PlayField } from '../../src/components/PlayField';
import { RemoteCursor } from '../../src/components/RemoteCursor';
import { ScoreBoard } from '../../src/components/ScoreBoard';
import Timer from '../../src/components/Timer';
import { useSocket } from '../../src/hooks/useSocket';
import type { PlayerWithResources } from '../../src/types/playerWithResources';
import './SampleRoom.css';

const SERVER_URL = 'http://127.0.0.1:4000';
const DRAGGABLE_IMAGE_PATH = '/hanabishi.svg';

interface TurnUpdatePayload {
  playerId: string;
  currentRound: number;
  currentTurnIndex: number;
}

export function SampleRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);

  const [userName, setUserName] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerWithResources[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  const GAME_PRESET_ID = 'sample';

  const handleJoinRoom = useCallback(() => {
    if (!socket || !roomId || userName.trim() === '' || isJoining) return;

    setIsJoining(true);
    socket.emit('room:join', {
      roomId,
      playerName: userName.trim(),
      gamePresetId: GAME_PRESET_ID,
    });
  }, [socket, roomId, userName, isJoining]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleAssignId = (id: string) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
    };

    const handlePlayersUpdate = (updatedPlayers: PlayerWithResources[]) => {
      setPlayers(updatedPlayers);
    };

    const handleGameTurn = (data: TurnUpdatePayload | string) => {
      if (typeof data === 'string') {
        setCurrentPlayerId(data);
      } else {
        setCurrentPlayerId(data.playerId);
        setCurrentRound(data.currentRound);
      }
    };

    socket.on('player:assign-id', handleAssignId);
    socket.on('players:update', handlePlayersUpdate);
    socket.on('game:turn', handleGameTurn);

    return () => {
      socket.off('player:assign-id', handleAssignId);
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
    <div className="game-container" ref={containerRef}>
      <h1>Room ID: {roomId}</h1>
      <div className="round-display">ROUND: {currentRound}</div>
      <ScoreBoard
        socket={socket}
        roomId={roomId}
        players={players}
        currentPlayerId={currentPlayerId}
        myPlayerId={myPlayerId}
      />

      <div style={{ display: 'flex', gap: '16px' }}>
        <Dice
          socket={socket}
          diceId="天気"
          roomId={roomId}
          title="天気ダイス"
          sides={4}
          customFaces={[
            <img key="f1" src="/weather_sunny.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
            <img key="f2" src="/weather_cloud.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
            <img key="f3" src="/weather_wind.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
            <img key="f4" src="/weather_rain.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
          ]}
          tooltipText="快晴・曇り・風・雨"
        />
        <Dice socket={socket} diceId="6面" roomId={roomId} sides={6} title="6面ダイス" />
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
      />
      <Draggable
        socket={socket}
        roomId={roomId}
        image={DRAGGABLE_IMAGE_PATH}
        mask={true}
        initialXY={{ x: 1000, y: 500 }}
        key={`piece`}
        draggableId={`piece`}
        containerRef={containerRef}
        color="red"
        size={10}
      ></Draggable>
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
