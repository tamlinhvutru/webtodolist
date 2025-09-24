import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  console.log('Received Auth Header:', authHeader);

  const token = authHeader && authHeader.split(' ')[0] === 'Bearer' ? authHeader.split(' ')[1] : undefined;
  console.log('Extracted Token:', token);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID found' });
    }
    (req as any).user = { id: decoded.userId, username: decoded.username }; // Lưu vào req.user
    console.log('Decoded User ID:', decoded.userId);
    next();
  } catch (err) {
    if (err instanceof Error) {
      console.error('Token Verification Error:', err.message);
    } else {
      console.error('Token Verification Error:', err);
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};