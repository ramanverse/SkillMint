/**
 * ==========================================
 * SkillMint Router - Gig Management
 * ==========================================
 * Handles creating, updating, listing, filtering, and deleting gig listings.
 * 1. GET /api/gigs - Filterable public marketplace directory search.
 * 2. GET /api/gigs/seller/my - Fetch authenticated user listings.
 * 3. GET /api/gigs/:id - Fetch detailed gig metrics & packages.
 * 4. POST /api/gigs - Create new listings (seller restricted).
 * 5. PUT /api/gigs/:id - Update existing listings.
 * 6. DELETE /api/gigs/:id - Delete listings.
 */

import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireSeller } from '../middleware/auth.js';
import { serializeGig, serializeUser, stringifyArray } from '../utils/serializers.js';

const router = Router();

/**
 * GET /api/gigs
 * Public marketplace gig search:
 * Supports category and text searching (matches title/description).
 * Implements pagination offsets for performance.
 * Leverages Promise.all for concurrent gig query and total result counting.
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const where = {};
    
    // Construct dynamic database queries
    if (category) where.category = category;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    // Concurrently fetch current page rows and count total items matching queries
    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
          packages: { orderBy: { price: 'asc' }, take: 1 }, // include lowest price tier as preview
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.gig.count({ where }),
    ]);

    res.json({ gigs: gigs.map(serializeGig), total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/gigs/seller/my
 * Freelancer-specific gig list:
 * Restricted to users containing the seller role.
 * Includes nested package details and direct counts of associated orders.
 */
router.get('/seller/my', authenticate, requireSeller, async (req, res) => {
  try {
    const gigs = await prisma.gig.findMany({
      where: { userId: req.user.id },
      include: { packages: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(gigs.map(serializeGig));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/gigs/:id
 * Single gig detail view:
 * Pulls detailed gig fields, packages, associated seller info, and reviews.
 */
router.get('/:id', async (req, res) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, profileImage: true, bio: true, skills: true } },
        packages: true,
        orders: {
          include: { review: true },
          where: { review: { isNot: null } },
          take: 10,
        },
      },
    });
    if (!gig) return res.status(404).json({ error: 'Gig not found' });
    const serialized = serializeGig(gig);
    serialized.user = serializeUser(serialized.user);
    res.json(serialized);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/gigs
 * Create new service listing:
 * Requires valid authenticated seller credentials.
 * Connects newly generated items to the current user's profile.
 * Implements nested creation for pricing packages (basic, standard, premium).
 */
router.post('/', authenticate, requireSeller, async (req, res) => {
  try {
    const { title, description, category, subcategory, tags, images, packages } = req.body;
    const gig = await prisma.gig.create({
      data: {
        userId: req.user.id,
        title, description, category,
        subcategory: subcategory || '',
        tags: stringifyArray(tags),
        images: stringifyArray(images),
        // Map and parse pricing fields to float numeric formats safely before saving
        packages: { create: (packages || []).map(p => ({ ...p, deliveryTime: Number(p.deliveryTime), price: Number(p.price) })) },
      },
      include: { packages: true },
    });
    res.status(201).json(serializeGig(gig));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/gigs/:id
 * Edit existing service listing:
 * Checks that the gig exists and belongs to the authenticated editor.
 * Performs updates and returns the updated gig details.
 */
router.put('/:id', authenticate, requireSeller, async (req, res) => {
  try {
    const gig = await prisma.gig.findUnique({ where: { id: req.params.id } });
    if (!gig || gig.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const { title, description, category, subcategory, tags, images } = req.body;
    const updated = await prisma.gig.update({
      where: { id: req.params.id },
      data: { title, description, category, subcategory, tags: stringifyArray(tags), images: stringifyArray(images) },
      include: { packages: true },
    });
    res.json(serializeGig(updated));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/gigs/:id
 * Remove service listing:
 * Checks ownership authorization before executing deletion commands.
 */
router.delete('/:id', authenticate, requireSeller, async (req, res) => {
  try {
    const gig = await prisma.gig.findUnique({ where: { id: req.params.id } });
    if (!gig || gig.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await prisma.gig.delete({ where: { id: req.params.id } });
    res.json({ message: 'Gig deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
