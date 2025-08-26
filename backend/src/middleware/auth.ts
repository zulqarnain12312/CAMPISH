import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({ message: 'Invalid token. User not found.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Access denied. Authentication required.' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const user = await User.findById(decoded.userId).select('-password');
      req.user = user || undefined;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};