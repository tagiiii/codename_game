// ゲームフェーズ
export type GamePhase = 'lobby' | 'in_progress' | 'finished';

// ターンフェーズ
export type TurnPhase = 'waiting_hint' | 'guessing';

// チーム
export type Team = 'red' | 'blue';

// 役割
export type Role = 'spymaster' | 'guesser';

// カードの種類
export type CardRole = 'red' | 'blue' | 'neutral' | 'assassin';

// プレイヤー
export interface Player {
  id: string;
  name: string;
  team: Team;
  role: Role;
  isHost: boolean;
}

// カード
export interface Card {
  index: number;
  word: string;
  role: CardRole;
  revealed: boolean;
}

// ヒント
export interface Hint {
  word: string;
  count: number;
  byPlayerId: string;
  updatedAt: Date;
}

// ゲームルーム
export interface GameRoom {
  createdAt: Date;
  expiresAt: Date;
  gamePhase: GamePhase;
  turnTeam: Team;
  turnPhase: TurnPhase;
  currentHint: Hint | null;
  remainingGuesses: number;
  cards: Card[];
  players: Player[];
  firstTeam: Team; // 先攻チーム
  winner?: Team; // 勝者（finished時のみ）
}

// 単語セット
export interface WordSet {
  id: string;
  label: string;
  words: string[];
}
