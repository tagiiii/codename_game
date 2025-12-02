import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { FinishPage } from './pages/FinishPage';
import { LandingPage } from './pages/LandingPage';
import { subscribeToRoom } from './firebase/gameService';
import type { GameRoom } from './types/game';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GameRoom['gamePhase'] | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (room) => {
      if (room) {
        setGamePhase(room.gamePhase);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleRoomJoined = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
  };

  const handleNewGame = () => {
    setRoomId(null);
    setPlayerId(null);
    setGamePhase(null);
    // ゲーム終了後はホーム画面（ルーム選択）に戻るため、LandingPageは表示しない
    setShowLanding(false);
  };

  // ランディングページ
  if (showLanding && !roomId) {
    return <LandingPage onStartGame={() => setShowLanding(false)} />;
  }

  // ホーム画面
  if (!roomId || !playerId) {
    return <HomePage onRoomJoined={handleRoomJoined} />;
  }

  // ロビー画面
  if (gamePhase === 'lobby') {
    return <LobbyPage roomId={roomId} playerId={playerId} />;
  }

  // ゲーム画面
  if (gamePhase === 'in_progress') {
    return <GamePage roomId={roomId} playerId={playerId} />;
  }

  // 終了画面
  if (gamePhase === 'finished') {
    return (
      <FinishPage
        roomId={roomId}
        playerId={playerId}
        onNewGame={handleNewGame}
      />
    );
  }

  // ローディング
  return <div>読み込み中...</div>;
}

export default App;
