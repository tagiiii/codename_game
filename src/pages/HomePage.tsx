import React, { useState } from 'react';
import { Header, Button, Input } from '../components';
import { createRoom, joinRoom } from '../firebase/gameService';
import { wordSets } from '../data/wordSets';
import type { Team } from '../types/game';
import styles from './HomePage.module.css';

interface HomePageProps {
  onRoomJoined: (roomId: string, playerId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRoomJoined }) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedWordSet, setSelectedWordSet] = useState(wordSets[0].id);
  const [firstTeam, setFirstTeam] = useState<Team>('red');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('名前を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const wordSet = wordSets.find((ws) => ws.id === selectedWordSet);
      if (!wordSet) {
        throw new Error('単語セットが見つかりません');
      }

      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const roomId = await createRoom(
        {
          id: playerId,
          name: playerName.trim(),
          team: 'red',
          role: 'guesser',
        },
        wordSet.words,
        firstTeam
      );

      onRoomJoined(roomId, playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルーム作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('名前を入力してください');
      return;
    }

    if (!roomCode.trim()) {
      setError('ルームコードを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await joinRoom(roomCode.trim().toUpperCase(), {
        id: playerId,
        name: playerName.trim(),
        team: 'red',
        role: 'guesser',
      });

      onRoomJoined(roomCode.trim().toUpperCase(), playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルーム参加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className={styles.container}>
        <Header
          title="Codenames Online"
          subtitle="チーム対戦型コミュニケーションゲーム"
        />
        <div className={styles.content}>
          <div className={styles.buttonGroup}>
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => setMode('create')}
            >
              新しいルームを作成
            </Button>
            <Button
              variant="secondary"
              size="large"
              fullWidth
              onClick={() => setMode('join')}
            >
              ルームに参加
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className={styles.container}>
        <Header title="ルームを作成" />
        <div className={styles.content}>
          <div className={styles.form}>
            <Input
              label="あなたの名前"
              placeholder="例: たろう"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              fullWidth
            />

            <div className={styles.selectGroup}>
              <label className={styles.label}>単語セット</label>
              <select
                className={styles.select}
                value={selectedWordSet}
                onChange={(e) => setSelectedWordSet(e.target.value)}
              >
                {wordSets.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label className={styles.label}>先攻チーム</label>
              <select
                className={styles.select}
                value={firstTeam}
                onChange={(e) => setFirstTeam(e.target.value as Team)}
              >
                <option value="red">赤チーム</option>
                <option value="blue">青チーム</option>
              </select>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.buttonGroup}>
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleCreateRoom}
                disabled={loading}
              >
                {loading ? '作成中...' : 'ルームを作成'}
              </Button>
              <Button
                variant="secondary"
                size="medium"
                fullWidth
                onClick={() => setMode('select')}
                disabled={loading}
              >
                戻る
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // mode === 'join'
  return (
    <div className={styles.container}>
      <Header title="ルームに参加" />
      <div className={styles.content}>
        <div className={styles.form}>
          <Input
            label="あなたの名前"
            placeholder="例: たろう"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            fullWidth
          />

          <Input
            label="ルームコード"
            placeholder="例: ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            fullWidth
            maxLength={6}
          />

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttonGroup}>
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleJoinRoom}
              disabled={loading}
            >
              {loading ? '参加中...' : 'ルームに参加'}
            </Button>
            <Button
              variant="secondary"
              size="medium"
              fullWidth
              onClick={() => setMode('select')}
              disabled={loading}
            >
              戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
