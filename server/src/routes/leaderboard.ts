import { Router } from 'express';
import { getAllUsers } from '../accounts';

const router = Router();

router.get('/leaderboard', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 100);
  const users = getAllUsers();
  const ranked = users
    .map(u => ({
      rank: 0,
      username: u.username,
      elo: u.elo,
      wins: u.wins,
      losses: u.losses,
      winRate: u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0,
    }))
    .sort((a, b) => b.elo - a.elo)
    .slice(0, limit)
    .map((u, i) => ({ ...u, rank: i + 1 }));
  res.json({ players: ranked });
});

export default router;
