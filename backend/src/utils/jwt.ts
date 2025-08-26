import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');
};