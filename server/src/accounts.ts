import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'cot-dev-secret-change-in-production';
const SALT_ROUNDS = 10;

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  elo: number;
  wins: number;
  losses: number;
  cardsPlayed: string[];
}

// In-memory store (Map)
const users = new Map<string, User>(); // key: email

export function register(username: string, email: string, password: string): { token: string; user: Omit<User, 'passwordHash'> } | null {
  if (users.has(email)) return null;
  const id = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const user: User = { id, username, email, passwordHash, elo: 1000, wins: 0, losses: 0, cardsPlayed: [] };
  users.set(email, user);
  return { token: signToken(user), user: toPublic(user) };
}

export function login(email: string, password: string): { token: string; user: Omit<User, 'passwordHash'> } | null {
  const user = users.get(email);
  if (!user) return null;
  if (!bcrypt.compareSync(password, user.passwordHash)) return null;
  return { token: signToken(user), user: toPublic(user) };
}

export function verifyToken(token: string): Omit<User, 'passwordHash'> | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = Array.from(users.values()).find(u => u.id === decoded.id && u.email === decoded.email);
    return user ? toPublic(user) : null;
  } catch { return null; }
}

export function getUserById(id: string): Omit<User, 'passwordHash'> | null {
  const user = Array.from(users.values()).find(u => u.id === id);
  return user ? toPublic(user) : null;
}

export function updateStats(userId: string, win: boolean, cardsPlayed: string[]): void {
  const user = Array.from(users.values()).find(u => u.id === userId);
  if (!user) return;
  if (win) user.wins++; else user.losses++;
  const eloChange = win ? 16 : -16;
  user.elo = Math.max(100, user.elo + eloChange);
  for (const cardId of cardsPlayed) {
    if (!user.cardsPlayed.includes(cardId)) user.cardsPlayed.push(cardId);
  }
}

export function updateElo(userId: string, newElo: number): void {
  const user = Array.from(users.values()).find(u => u.id === userId);
  if (user) user.elo = Math.round(newElo);
}

export function getAllUsers(): Omit<User, 'passwordHash'>[] {
  return Array.from(users.values()).map(toPublic);
}

function signToken(user: User): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function toPublic(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash, ...rest } = user;
  return rest;
}
