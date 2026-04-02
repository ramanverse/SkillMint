import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireSeller } from '../middleware/auth.js';
import { serializeGig, serializeUser, stringifyArray } from '../utils/serializers.js';

const router = Router();

// GET /api/gigs - list all gigs
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const where = {};
    if (category) where.category = category;
    if (search) where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
          packages: { orderBy: { price: 'asc' }, take: 1 },
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

// GET /api/gigs/seller/my - must be before /:id
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

// GET /api/gigs/:id
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

// POST /api/gigs
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

// PUT /api/gigs/:id
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

// DELETE /api/gigs/:id
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
