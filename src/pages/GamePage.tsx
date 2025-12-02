import React, { useState, useEffect, useRef } from 'react';
import { Header, Button, Input } from '../components';
import { Card } from '../components/Card';
import { NotificationOverlay } from '../components/NotificationOverlay';
import type { NotificationType } from '../components/NotificationOverlay';
import { CopyButton } from '../components/CopyButton';
import {
  subscribeToRoom,
  submitHint,
  revealCard,
  endTurn,
} from '../firebase/gameService';
import { TEAM_COLORS, TEAM_NAMES, ROLE_NAMES } from '../utils/constants';
import type { GameRoom } from '../types/game';
import styles from './GamePage.module.css';

interface GamePageProps {
  roomId: string;
  playerId: string;
}

export const GamePage: React.FC<GamePageProps> = ({ roomId, playerId }) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [hintWord, setHintWord] = useState('');
  const [hintCount, setHintCount] = useState('1');
  const [error, setError] = useState('');

  // Notification State
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });

  // Previous state refs for detecting changes
  const prevTurnTeam = useRef<string | null>(null);
  const prevGamePhase = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomId, (roomData) => {
      setRoom(roomData);

      if (!roomData) return;

      // Detect Turn Change
      if (prevTurnTeam.current && prevTurnTeam.current !== roomData.turnTeam) {
        setNotification({
          message: `${TEAM_NAMES[roomData.turnTeam]} のターン！`,
          type: 'info',
          isVisible: true,
        });
      }
      prevTurnTeam.current = roomData.turnTeam;

      // Detect Game End
      if (prevGamePhase.current !== 'finished' && roomData.gamePhase === 'finished') {
        if (roomData.winner) {
          setNotification({
            message: `${TEAM_NAMES[roomData.winner]} の勝利！`,
            type: 'success',
            isVisible: true,
          });
        }
      }
      prevGamePhase.current = roomData.gamePhase;
    });

    return () => unsubscribe();
  }, [roomId]);

  // Assassin Detection (Client-side check for immediate feedback)
  const handleRevealCard = async (cardIndex: number) => {
    try {
      if (room && room.cards[cardIndex].role === 'assassin') {
        setNotification({
          message: '暗殺者！\nゲーム終了',
          type: 'danger',
          isVisible: true,
        });
      }
      await revealCard(roomId, cardIndex);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カード公開に失敗しました');
    }
  };

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

  const isMyTurn = room.turnTeam === currentPlayer.team;
  const isSpymaster = currentPlayer.role === 'spymaster';
  const canGiveHint =
    isMyTurn && isSpymaster && room.turnPhase === 'waiting_hint';
  const canGuess = isMyTurn && !isSpymaster && room.turnPhase === 'guessing';

  const handleSubmitHint = async () => {
    if (!hintWord.trim()) {
      setError('ヒントを入力してください');
      return;
    }

    const count = parseInt(hintCount, 10);
    if (isNaN(count) || count < 1 || count > 9) {
      setError('枚数は1〜9の数字で入力してください');
      return;
    }

    try {
      await submitHint(roomId, {
        word: hintWord.trim(),
        count,
        byPlayerId: playerId,
      });
      setHintWord('');
      setHintCount('1');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ヒント送信に失敗しました');
    }
  };

  const handleEndTurn = async () => {
    try {
      await endTurn(roomId);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ターン終了に失敗しました');
    }
  };

  const redCards = room.cards.filter((c) => c.role === 'red');
  const blueCards = room.cards.filter((c) => c.role === 'blue');
  const redRemaining = redCards.filter((c) => !c.revealed).length;
  const blueRemaining = blueCards.filter((c) => !c.revealed).length;

  return (
    <div className={styles.container}>
      <NotificationOverlay
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onAnimationEnd={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <Header
        title={
          <>
            ルーム: {roomId}
            <CopyButton text={roomId} />
          </>
        }
        subtitle={currentPlayer.name}
      />

      <div className={styles.content}>
        {/* エラー表示 */}
        {error && <div className={styles.error}>{error}</div>}

        {/* ターン情報 */}
        <div className={styles.turnInfo}>
          <div
            className={styles.turnIndicator}
            style={{
              backgroundColor: TEAM_COLORS[room.turnTeam],
            }}
          >
            <h2>{TEAM_NAMES[room.turnTeam]}のターン</h2>
            <p>
              {room.turnPhase === 'waiting_hint'
                ? 'スパイマスターがヒント入力中...'
                : `推理中（残り${room.remainingGuesses} 回）`}
            </p>
          </div>

          {/* スコア */}
          <div className={styles.score}>
            <div
              className={styles.scoreItem}
              style={{ backgroundColor: TEAM_COLORS.red }}
            >
              <span>赤チーム</span>
              <strong>{redRemaining}</strong>
            </div>
            <div
              className={styles.scoreItem}
              style={{ backgroundColor: TEAM_COLORS.blue }}
            >
              <span>青チーム</span>
              <strong>{blueRemaining}</strong>
            </div>
          </div>
        </div>

        {/* 現在のヒント */}
        {room.currentHint && (
          <div className={styles.currentHint}>
            <h3>現在のヒント:</h3>
            <div className={styles.hintDisplay}>
              <span className={styles.hintWord}>{room.currentHint.word}</span>
              <span className={styles.hintCount}>{room.currentHint.count}枚</span>
            </div>
          </div>
        )}

        {/* ヒント入力（スパイマスター専用） */}
        {canGiveHint && (
          <div className={styles.hintInput}>
            <h3>ヒントを入力してください</h3>
            <div className={styles.hintForm}>
              <Input
                placeholder="例: どうぶつ"
                value={hintWord}
                onChange={(e) => setHintWord(e.target.value)}
                fullWidth
              />
              <Input
                type="number"
                placeholder="枚数"
                value={hintCount}
                onChange={(e) => setHintCount(e.target.value)}
                min="1"
                max="9"
                style={{ maxWidth: '120px' }}
              />
              <Button variant="primary" onClick={handleSubmitHint}>
                ヒント送信
              </Button>
            </div>
          </div>
        )}

        {/* カードグリッド */}
        <div className={styles.cardGrid}>
          {room.cards.map((card) => (
            <Card
              key={card.index}
              card={card}
              isSpymaster={isSpymaster}
              canClick={canGuess}
              onClick={() => handleRevealCard(card.index)}
            />
          ))}
        </div>

        {/* ターン終了ボタン */}
        {canGuess && (
          <div className={styles.endTurnButton}>
            <Button variant="secondary" onClick={handleEndTurn}>
              ターンを終了（パス）
            </Button>
          </div>
        )}

        {/* プレイヤー一覧 */}
        <div className={styles.players}>
          <h3>プレイヤー一覧</h3>
          <div className={styles.playerLists}>
            <div
              className={styles.playerList}
              style={{ borderColor: TEAM_COLORS.red }}
            >
              <h4 style={{ color: TEAM_COLORS.red }}>赤チーム</h4>
              {room.players
                .filter((p) => p.team === 'red')
                .map((p) => (
                  <div key={p.id} className={styles.playerItem}>
                    {p.name} ({ROLE_NAMES[p.role]})
                  </div>
                ))}
            </div>
            <div
              className={styles.playerList}
              style={{ borderColor: TEAM_COLORS.blue }}
            >
              <h4 style={{ color: TEAM_COLORS.blue }}>青チーム</h4>
              {room.players
                .filter((p) => p.team === 'blue')
                .map((p) => (
                  <div key={p.id} className={styles.playerItem}>
                    {p.name} ({ROLE_NAMES[p.role]})
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
