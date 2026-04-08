/**
 * ==========================================
 * SkillMint Authentication Middleware
 * ==========================================
 * Provides server-side guards for protecting HTTP endpoints.
 * Integrates JSON Web Tokens (JWT) for authentication.
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

/**
 * Endpoint Authentication Guard
 * 1. Checks if authorization headers contain a valid bearer token.
 * 2. Decodes user details from JWT token.
 * 3. Confirms user presence inside the Supabase database via Prisma client.
 * 4. Appends verified user context to Express request (req.user) to pass validation downstream.
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract Token from Authorization header: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    // Validate and decode JWT payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Retrieve associated user records
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Inject user context to request lifecycle
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role authorization guard: Require Seller Role
 * Ensures authenticated requests originate from accounts containing "SELLER" roles.
 * Returns 403 Forbidden for accounts containing BUYER-only credentials.
 */
export const requireSeller = (req, res, next) => {
  if (req.user.role !== 'SELLER') {
    return res.status(403).json({ error: 'Seller access required' });
  }
  next();
};
