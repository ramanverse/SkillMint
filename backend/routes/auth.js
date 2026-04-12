/**
 * ==========================================
 * SkillMint Router - Authentication Paths
 * ==========================================
 * Manages user accounts, authentication pipelines, and profile payloads:
 * 1. Traditional Email/Password Signup & Login via bcryptjs encryption.
 * 2. Google OAuth2 credential verification.
 * 3. Session confirmation via /api/auth/me.
 * 4. Fast demo accounts for streamlined interview presentations.
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../index.js';
import { serializeUser, stringifyArray } from '../utils/serializers.js';
import { authenticate } from '../middleware/auth.js';

// Setup Google Identity authentication handler
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = Router();

/**
 * Standard Authentication Token Signer
 * Signs a 7-day duration token with crucial payload (id, email, and user role).
 */
const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

/**
 * User Payload Safety Filter
 * Ensures sensitive data like passwords are removed before sending payloads to clients.
 */
const safeUser = (u) => ({
  id: u.id, name: u.name, email: u.email,
  role: u.role, profileImage: u.profileImage,
  bio: u.bio, skills: u.skills,
});

/**
 * POST /api/auth/signup
 * Standard registration route:
 * 1. Validates payload parameters.
 * 2. Scans database for email duplicates.
 * 3. Hashes raw passwords using high-security 12 salt rounds.
 * 4. Generates an authorized session token for immediate client login.
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'BUYER' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    // Hashing secure salt values to obfuscate passcodes safely
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

/**
 * POST /api/auth/login
 * Standard authentication route:
 * 1. Checks if credentials match database records.
 * 2. Compares raw request passwords against stored bcrypt hash strings.
 * 3. Issues authorization tokens upon success.
 */
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

/**
 * POST /api/auth/google
 * Google Auth verification route:
 * 1. Validates Google client token credentials.
 * 2. Obtains user profile data (email, name, image) from Google servers.
 * 3. Finds or creates the user in the database.
 * 4. Syncs the user's avatar image.
 * 5. Returns a standard JWT token.
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credential token required' });

    // Validate identity token via Google library
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Lazy initialization: create new user profile dynamically
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: await bcrypt.hash(Math.random().toString(36), 12), // Placeholder password
          role: 'BUYER',
          profileImage: picture,
          skills: '[]'
        }
      });
    } else if (!user.profileImage && picture) {
      // Sync Google profile photo if not already cached locally
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

/**
 * GET /api/auth/me
 * Gets currently logged in user:
 * Utilizes the authentication middleware context to return the profile data.
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const serialized = serializeUser(safeUser(req.user));
    res.json({ user: serialized });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/demo
 * Presentation / Interview login helper:
 * Avoids long signups by logging directly into dummy mock accounts.
 * Generates dummy user records for both Freelancers and Buyers with pre-filled content.
 * Uses 6 hashing rounds for extreme performance speeds during demo cycles.
 */
router.post('/demo', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['BUYER', 'SELLER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const email = role === 'BUYER' ? 'hirer.demo@skillmint.com' : 'freelancer.demo@skillmint.com';
    const name = role === 'BUYER' ? 'Demo Hirer' : 'Demo Freelancer';

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const hashed = await bcrypt.hash('demo1234', 6); // Faster encryption cycles for demo speeds
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role,
          bio: role === 'BUYER' ? 'I am a demo hirer looking for talent.' : 'I am a demo freelancer offering premium services.',
          skills: role === 'SELLER' ? JSON.stringify(['React', 'Node.js', 'Design']) : '[]',
        },
      });
    }

    const serialized = serializeUser(safeUser(user));
    const token = signToken(user);
    res.json({ user: serialized, token });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
