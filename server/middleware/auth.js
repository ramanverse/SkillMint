import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireSeller = (req, res, next) => {
  if (req.user.role !== 'SELLER') {
    return res.status(403).json({ error: 'Seller access required' });
  }
  next();
};
