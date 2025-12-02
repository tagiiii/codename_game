import React, { useState, useEffect } from 'react';
import { Header, Button } from '../components';
import { CopyButton } from '../components/CopyButton';
import { subscribeToRoom, updatePlayerRole, startGame } from '../firebase/gameService';
import { TEAM_COLORS, TEAM_NAMES, ROLE_NAMES } from '../utils/constants';
import type { GameRoom, Team, Role } from '../types/game';
import styles from './LobbyPage.module.css';

interface LobbyPageProps {
  roomId: string;
  playerId: string;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({ roomId, playerId }) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      setRoom(roomData);
    });

    return () => unsubscribe();
  }, [roomId]);

  if (!room) {
    return (
      <div className={styles.container}>
        <Header title="読み込み中..." />
      </div>
    );
  }

  const currentPlayer = room.players.find((p) => p.id === playerId);
  if (!currentPlayer) {
    return (
      <div className={styles.container}>
        <Header title="エラー" subtitle="プレイヤーが見つかりません" />
      </div>
    );
  }

  const isHost = currentPlayer.isHost;
  const redPlayers = room.players.filter((p) => p.team === 'red');
  const bluePlayers = room.players.filter((p) => p.team === 'blue');
  const redSpymaster = redPlayers.find((p) => p.role === 'spymaster');
  const blueSpymaster = bluePlayers.find((p) => p.role === 'spymaster');

  const handleTeamChange = async (team: Team) => {
    try {
      await updatePlayerRole(roomId, playerId, { team });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チーム変更に失敗しました');
    }
  };

  const handleRoleChange = async (role: Role) => {
    try {
      // スパイマスターが既にいる場合は変更不可
      const currentTeamPlayers = room.players.filter(
        (p) => p.team === currentPlayer.team
      );
      const existingSpymaster = currentTeamPlayers.find(
        (p) => p.role === 'spymaster' && p.id !== playerId
      );

      if (role === 'spymaster' && existingSpymaster) {
        setError(`${TEAM_NAMES[currentPlayer.team]}のスパイマスターは既にいます`);
        return;
      }

      await updatePlayerRole(roomId, playerId, { role });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '役割変更に失敗しました');
    }
  };

  const handleStartGame = async () => {
    // 各チームに最低1人ずついるかチェック
    if (redPlayers.length === 0 || bluePlayers.length === 0) {
      setError('各チームに最低1人のプレイヤーが必要です');
      return;
    }

    // 各チームにスパイマスターがいるかチェック
    if (!redSpymaster || !blueSpymaster) {
      setError('各チームにスパイマスターが必要です');
      return;
    }

    try {
      await startGame(roomId);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ゲーム開始に失敗しました');
    }
  };

  return (
    <div className={styles.container}>
      <Header
        title={
          <>
            ルーム: {roomId}
            <CopyButton text={roomId} />
          </>
        }
        subtitle="チーム分けと役割を選択してください"
      />
      <div className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}

        {/* 現在のプレイヤー情報 */}
        <div className={styles.playerInfo}>
          <h3>あなた: {currentPlayer.name}</h3>
          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <label className={styles.label}>チーム:</label>
              <div className={styles.teamButtons}>
                <Button
                  variant={currentPlayer.team === 'red' ? 'danger' : 'secondary'}
                  size="small"
                  onClick={() => handleTeamChange('red')}
                  style={{
                    backgroundColor:
                      currentPlayer.team === 'red' ? TEAM_COLORS.red : undefined,
                  }}
                >
                  赤チーム
                </Button>
                <Button
                  variant={currentPlayer.team === 'blue' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleTeamChange('blue')}
                  style={{
                    backgroundColor:
                      currentPlayer.team === 'blue' ? TEAM_COLORS.blue : undefined,
                  }}
                >
                  青チーム
                </Button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.label}>役割:</label>
              <div className={styles.roleButtons}>
                <Button
                  variant={currentPlayer.role === 'spymaster' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleRoleChange('spymaster')}
                >
                  スパイマスター
                </Button>
                <Button
                  variant={currentPlayer.role === 'guesser' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => handleRoleChange('guesser')}
                >
                  推理プレイヤー
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* チーム一覧 */}
        <div className={styles.teams}>
          <div
            className={styles.team}
            style={{ borderColor: TEAM_COLORS.red }}
          >
            <h3 style={{ color: TEAM_COLORS.red }}>赤チーム</h3>
            <div className={styles.playerList}>
              {redPlayers.map((player) => (
                <div key={player.id} className={styles.player}>
                  <span className={styles.playerName}>
                    {player.name}
                    {player.isHost && ' (ホスト)'}
                  </span>
                  <span className={styles.playerRole}>
                    {player.role === 'spymaster' ? '🎯 ' : ''}
                    {ROLE_NAMES[player.role]}
                  </span>
                </div>
              ))}
              {redPlayers.length === 0 && (
                <div className={styles.emptyMessage}>プレイヤーがいません</div>
              )}
            </div>
          </div>

          <div
            className={styles.team}
            style={{ borderColor: TEAM_COLORS.blue }}
          >
            <h3 style={{ color: TEAM_COLORS.blue }}>青チーム</h3>
            <div className={styles.playerList}>
              {bluePlayers.map((player) => (
                <div key={player.id} className={styles.player}>
                  <span className={styles.playerName}>
                    {player.name}
                    {player.isHost && ' (ホスト)'}
                  </span>
                  <span className={styles.playerRole}>
                    {player.role === 'spymaster' ? '🎯 ' : ''}
                    {ROLE_NAMES[player.role]}
                  </span>
                </div>
              ))}
              {bluePlayers.length === 0 && (
                <div className={styles.emptyMessage}>プレイヤーがいません</div>
              )}
            </div>
          </div>
        </div>

        {/* ゲーム開始ボタン（ホストのみ） */}
        {isHost && (
          <div className={styles.startButton}>
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleStartGame}
            >
              ゲーム開始
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
