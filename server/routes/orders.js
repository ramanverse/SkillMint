import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/orders - place an order
router.post('/', authenticate, async (req, res) => {
  try {
    const { gigId, packageId } = req.body;
    const pkg = await prisma.package.findUnique({ where: { id: packageId }, include: { gig: true } });
    if (!pkg || pkg.gigId !== gigId) return res.status(400).json({ error: 'Invalid package' });

    const order = await prisma.order.create({
      data: {
        buyerId: req.user.id,
        sellerId: pkg.gig.userId,
        gigId,
        packageId,
        status: 'PENDING',
      },
      include: {
        gig: { select: { title: true } },
        package: true,
        buyer: { select: { id: true, name: true, profileImage: true } },
        seller: { select: { id: true, name: true, profileImage: true } },
      },
    });
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders - get user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const isSeller = req.user.role === 'SELLER';
    const orders = await prisma.order.findMany({
      where: isSeller ? { sellerId: req.user.id } : { buyerId: req.user.id },
      include: {
        gig: { select: { title: true, images: true } },
        package: true,
        buyer: { select: { id: true, name: true, profileImage: true } },
        seller: { select: { id: true, name: true, profileImage: true } },
        review: true,
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        gig: true,
        package: true,
        buyer: { select: { id: true, name: true, profileImage: true } },
        seller: { select: { id: true, name: true, profileImage: true, bio: true } },
        messages: { include: { sender: { select: { id: true, name: true, profileImage: true } } }, orderBy: { createdAt: 'asc' } },
        review: true,
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.sellerId !== req.user.id && order.buyerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders/:id/review
router.post('/:id/review', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.buyerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (order.status !== 'COMPLETED') return res.status(400).json({ error: 'Order not completed' });

    const review = await prisma.review.create({ data: { orderId: req.params.id, rating, comment } });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
