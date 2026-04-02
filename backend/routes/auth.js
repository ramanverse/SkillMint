import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../index.js';
import { serializeUser, stringifyArray } from '../utils/serializers.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credential token required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user if not exists
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: await bcrypt.hash(Math.random().toString(36), 12), // Random password
          role: 'BUYER',
          profileImage: picture,
          skills: '[]'
        }
      });
    } else if (!user.profileImage && picture) {
      // Update profile image if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: picture }
      });
    }

    const serialized = serializeUser(safeUser(user));
    const token = signToken(user);
    res.json({ user: serialized, token });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

export default router;
