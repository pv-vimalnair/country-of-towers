import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../accounts';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice(7);
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  (req as any).user = user;
  next();
}
