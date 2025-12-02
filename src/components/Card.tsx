import React from 'react';
import { CARD_ROLE_COLORS } from '../utils/constants';
import type { Card as CardType } from '../types/game';
import styles from './Card.module.css';

interface CardProps {
  card: CardType;
  isSpymaster: boolean;
  canClick: boolean;
  onClick: () => void;
}

export const Card: React.FC<CardProps> = ({
  card,
  isSpymaster,
  canClick,
  onClick,
}) => {
  const getCardStyle = () => {
    if (card.revealed) {
      // 公開済みの場合は役割の色を表示
      return {
        backgroundColor: CARD_ROLE_COLORS[card.role],
        color: 'white',
      };
    }

    if (isSpymaster) {
      // スパイマスターは未公開でも色が見える（薄く）
      return {
        backgroundColor: CARD_ROLE_COLORS[card.role],
        color: 'white',
        opacity: 0.7,
      };
    }

    // 通常プレイヤーは未公開なら白
    return {
      backgroundColor: '#f8f9fa',
      color: '#213547',
    };
  };

  return (
    <button
      className={`${styles.card} ${card.revealed ? styles.revealed : ''} ${
        canClick && !card.revealed ? styles.clickable : ''
      }`}
      style={getCardStyle()}
      onClick={() => canClick && !card.revealed && onClick()}
      disabled={!canClick || card.revealed}
    >
      <span className={styles.word}>{card.word}</span>
      {card.revealed && card.role === 'assassin' && (
        <span className={styles.assassinIcon}>☠️</span>
      )}
    </button>
  );
};
