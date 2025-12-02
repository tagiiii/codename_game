import type { Team, CardRole } from '../types/game';

// チームカラー
export const TEAM_COLORS: Record<Team, string> = {
  red: '#DC143C',
  blue: '#1E90FF',
};

// カード役割の色
export const CARD_ROLE_COLORS: Record<CardRole, string> = {
  red: '#DC143C',
  blue: '#1E90FF',
  neutral: '#D3D3D3',
  assassin: '#2F4F4F',
};

// チーム名（日本語）
export const TEAM_NAMES: Record<Team, string> = {
  red: '赤チーム',
  blue: '青チーム',
};

// 役割名（日本語）
export const ROLE_NAMES = {
  spymaster: 'スパイマスター',
  guesser: '推理プレイヤー',
};
