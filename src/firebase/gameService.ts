import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './config';
import type { GameRoom, Player, Card, Hint, Team, CardRole } from '../types/game';
import { shuffleArray } from '../utils/array';

const ROOMS_COLLECTION = 'rooms';
const ROOM_LIFETIME_HOURS = 3;

// カードの配分（Codenames標準ルール）
const CARD_DISTRIBUTION = {
  firstTeam: 9,  // 先攻チーム
  secondTeam: 8, // 後攻チーム
  neutral: 7,    // 中立
  assassin: 1,   // 暗殺者
};

/**
 * ルームIDを生成（6桁の英数字）
 */
export const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * カードを生成
 */
const generateCards = (words: string[], firstTeam: Team): Card[] => {
  const shuffledWords = shuffleArray([...words]).slice(0, 25);
  const roles: CardRole[] = [];

  // 先攻チーム（9枚）
  for (let i = 0; i < CARD_DISTRIBUTION.firstTeam; i++) {
    roles.push(firstTeam);
  }

  // 後攻チーム（8枚）
  const secondTeam: Team = firstTeam === 'red' ? 'blue' : 'red';
  for (let i = 0; i < CARD_DISTRIBUTION.secondTeam; i++) {
    roles.push(secondTeam);
  }

  // 中立（7枚）
  for (let i = 0; i < CARD_DISTRIBUTION.neutral; i++) {
    roles.push('neutral');
  }

  // 暗殺者（1枚）
  for (let i = 0; i < CARD_DISTRIBUTION.assassin; i++) {
    roles.push('assassin');
  }

  // シャッフル
  const shuffledRoles = shuffleArray(roles);

  // カード配列を作成
  return shuffledWords.map((word, index) => ({
    index,
    word,
    role: shuffledRoles[index],
    revealed: false,
  }));
};

/**
 * 新しいルームを作成
 */
export const createRoom = async (
  hostPlayer: Omit<Player, 'isHost'>,
  words: string[],
  firstTeam: Team
): Promise<string> => {
  const roomId = generateRoomId();
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + ROOM_LIFETIME_HOURS * 60 * 60 * 1000
  );

  const cards = generateCards(words, firstTeam);

  const room: Omit<GameRoom, 'createdAt' | 'expiresAt'> & {
    createdAt: Timestamp;
    expiresAt: Timestamp;
  } = {
    createdAt: now,
    expiresAt,
    gamePhase: 'lobby',
    turnTeam: firstTeam,
    turnPhase: 'waiting_hint',
    currentHint: null,
    remainingGuesses: 0,
    cards,
    players: [{ ...hostPlayer, isHost: true }],
    firstTeam,
  };

  await setDoc(doc(db, ROOMS_COLLECTION, roomId), room);
  return roomId;
};

/**
 * ルームに参加
 */
export const joinRoom = async (
  roomId: string,
  player: Omit<Player, 'isHost'>
): Promise<void> => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('ルームが見つかりません');
  }

  const room = roomSnap.data() as GameRoom;

  // 期限切れチェック
  if ((room.expiresAt as any).toMillis() < Date.now()) {
    throw new Error('このルームは期限切れです');
  }

  // 最大人数チェック（8人）
  if (room.players.length >= 8) {
    throw new Error('ルームが満員です');
  }

  // 重複チェック
  if (room.players.some((p) => p.id === player.id)) {
    throw new Error('既に参加しています');
  }

  await updateDoc(roomRef, {
    players: arrayUnion({ ...player, isHost: false }),
  });
};

/**
 * プレイヤーのチーム・役割を更新（lobby時のみ）
 */
export const updatePlayerRole = async (
  roomId: string,
  playerId: string,
  updates: Partial<Pick<Player, 'team' | 'role'>>
): Promise<void> => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('ルームが見つかりません');
  }

  const room = roomSnap.data() as GameRoom;

  // lobby以外では変更不可
  if (room.gamePhase !== 'lobby') {
    throw new Error('ゲーム開始後は役割を変更できません');
  }

  const updatedPlayers = room.players.map((p) =>
    p.id === playerId ? { ...p, ...updates } : p
  );

  await updateDoc(roomRef, {
    players: updatedPlayers,
  });
};

/**
 * ゲームを開始
 */
export const startGame = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await updateDoc(roomRef, {
    gamePhase: 'in_progress',
  });
};

/**
 * ヒントを送信
 */
export const submitHint = async (
  roomId: string,
  hint: Omit<Hint, 'updatedAt'>
): Promise<void> => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await updateDoc(roomRef, {
    currentHint: {
      ...hint,
      updatedAt: Timestamp.now(),
    },
    turnPhase: 'guessing',
    remainingGuesses: hint.count + 1,
  });
};

/**
 * カードを公開
 */
export const revealCard = async (
  roomId: string,
  cardIndex: number
): Promise<void> => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('ルームが見つかりません');
  }

  const room = roomSnap.data() as GameRoom;
  const card = room.cards[cardIndex];

  if (card.revealed) {
    return; // 既に公開済み
  }

  // カードを公開
  const updatedCards = room.cards.map((c, i) =>
    i === cardIndex ? { ...c, revealed: true } : c
  );

  const updates: any = {
    cards: updatedCards,
  };

  // 暗殺者チェック
  if (card.role === 'assassin') {
    // 暗殺者を引いたチームの敗北
    const winnerTeam = room.turnTeam === 'red' ? 'blue' : 'red';
    updates.gamePhase = 'finished';
    updates.winner = winnerTeam;
    await updateDoc(roomRef, updates);
    return;
  }

  // 自チームのカードか判定
  const isOwnTeamCard = card.role === room.turnTeam;

  if (isOwnTeamCard) {
    // 自チームのカードを引いた場合、残り推測回数を減らす
    const newRemaining = room.remainingGuesses - 1;
    updates.remainingGuesses = newRemaining;

    // 勝利条件チェック
    const ownTeamCards = updatedCards.filter((c) => c.role === room.turnTeam);
    const revealedOwnCards = ownTeamCards.filter((c) => c.revealed);

    if (revealedOwnCards.length === ownTeamCards.length) {
      // 全て公開したら勝利
      updates.gamePhase = 'finished';
      updates.winner = room.turnTeam;
    } else if (newRemaining === 0) {
      // 残り回数が0ならターン終了
      updates.turnTeam = room.turnTeam === 'red' ? 'blue' : 'red';
      updates.turnPhase = 'waiting_hint';
      updates.currentHint = null;
      updates.remainingGuesses = 0;
    }
  } else {
    // 相手チームまたは中立のカードを引いた場合、即ターン終了
    updates.turnTeam = room.turnTeam === 'red' ? 'blue' : 'red';
    updates.turnPhase = 'waiting_hint';
    updates.currentHint = null;
    updates.remainingGuesses = 0;
  }

  await updateDoc(roomRef, updates);
};

/**
 * ターンを終了（パス）
 */
export const endTurn = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await updateDoc(roomRef, {
    turnTeam: (await getDoc(roomRef)).data()?.turnTeam === 'red' ? 'blue' : 'red',
    turnPhase: 'waiting_hint',
    currentHint: null,
    remainingGuesses: 0,
  });
};

/**
 * ルームをリアルタイム監視
 */
export const subscribeToRoom = (
  roomId: string,
  callback: (room: GameRoom | null) => void
): (() => void) => {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const room: GameRoom = {
        ...data,
        createdAt: data.createdAt.toDate(),
        expiresAt: data.expiresAt.toDate(),
        currentHint: data.currentHint
          ? {
            ...data.currentHint,
            updatedAt: data.currentHint.updatedAt.toDate(),
          }
          : null,
      } as GameRoom;
      callback(room);
    } else {
      callback(null);
    }
  });
};
