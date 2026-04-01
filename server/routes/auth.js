import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { serializeUser, stringifyArray } from '../utils/serializers.js';

const router = Router();

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const safeUser = (u) => ({
  id: u.id, name: u.name, email: u.email,
  role: u.role, profileImage: u.profileImage,
  bio: u.bio, skills: u.skills,
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'BUYER' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, skills: '[]' },
    });

    const serialized = serializeUser(safeUser(user));
    const token = signToken(user);
    res.status(201).json({ user: serialized, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const serialized = serializeUser(safeUser(user));
    const token = signToken(user);
    res.json({ user: serialized, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({ user: serializeUser(safeUser(user)) });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
