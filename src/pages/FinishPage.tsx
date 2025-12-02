import React, { useEffect, useState } from 'react';
import { Header, Button } from '../components';
import { subscribeToRoom } from '../firebase/gameService';
import { TEAM_COLORS, TEAM_NAMES } from '../utils/constants';
import type { GameRoom } from '../types/game';
import styles from './FinishPage.module.css';

interface FinishPageProps {
  roomId: string;
  playerId: string;
  onNewGame: () => void;
}

export const FinishPage: React.FC<FinishPageProps> = ({
  roomId,
  playerId,
  onNewGame,
}) => {
  const [room, setRoom] = useState<GameRoom | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      setRoom(roomData);
    });

    return () => unsubscribe();
  }, [roomId]);

  if (!room || !room.winner) {
    return (
      <div className={styles.container}>
        <Header title="読み込み中..." />
      </div>
    );
  }

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const isWinner = currentPlayer?.team === room.winner;
  const winnerColor = TEAM_COLORS[room.winner];

  return (
    <div className={styles.container}>
      <Header title="ゲーム終了" />

      <div className={styles.content}>
        <div
          className={styles.result}
          style={{ backgroundColor: winnerColor }}
        >
          <h1 className={styles.winnerTitle}>
            {TEAM_NAMES[room.winner]}の勝利！
          </h1>
          <div className={styles.trophy}>🏆</div>
          {isWinner ? (
            <p className={styles.message}>おめでとうございます！</p>
          ) : (
            <p className={styles.message}>次回は頑張りましょう！</p>
          )}
        </div>

        <div className={styles.stats}>
          <h2>最終結果</h2>
          <div className={styles.teams}>
            <div
              className={styles.team}
              style={{ borderColor: TEAM_COLORS.red }}
            >
              <h3 style={{ color: TEAM_COLORS.red }}>赤チーム</h3>
              <div className={styles.playerList}>
                {room.players
                  .filter((p) => p.team === 'red')
                  .map((p) => (
                    <div key={p.id} className={styles.player}>
                      {p.name}
                      {p.role === 'spymaster' && ' (スパイマスター)'}
                    </div>
                  ))}
              </div>
            </div>

            <div
              className={styles.team}
              style={{ borderColor: TEAM_COLORS.blue }}
            >
              <h3 style={{ color: TEAM_COLORS.blue }}>青チーム</h3>
              <div className={styles.playerList}>
                {room.players
                  .filter((p) => p.team === 'blue')
                  .map((p) => (
                    <div key={p.id} className={styles.player}>
                      {p.name}
                      {p.role === 'spymaster' && ' (スパイマスター)'}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" size="large" fullWidth onClick={onNewGame}>
            新しいゲームを始める
          </Button>
        </div>
      </div>
    </div>
  );
};
