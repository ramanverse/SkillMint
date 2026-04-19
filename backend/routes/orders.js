/**
 * ==========================================
 * SkillMint Router - Order & Transaction Management
 * ==========================================
 * Orchestrates order flows, buyer-seller relationships, order states, and reviews.
 * 1. POST /api/orders - Initiate order placement based on a pricing package.
 * 2. GET /api/orders - Retrieve current user's order lists (dynamic buyer/seller views).
 * 3. GET /api/orders/:id - Detailed order tracking, chat histories, and review metrics.
 * 4. PATCH /api/orders/:id/status - Update project phases (PENDING -> IN_PROGRESS -> COMPLETED).
 * 5. POST /api/orders/:id/review - Review posting (restricted to completed transactions).
 */

import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/orders
 * Purchase a gig service:
 * 1. Pulls package properties and confirms parent gig existence.
 * 2. Generates an order record initialized in "PENDING" status.
 * 3. Connects foreign keys linking buyer, seller, gig, and package models.
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { gigId, packageId } = req.body;
    
    // Validate package existence and confirm parent gig relation matches request
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

/**
 * GET /api/orders
 * Retrieve order history list:
 * Dynamically queries database depending on whether logged-in account is a buyer or seller.
 * Includes nested parent titles, pricing, profiles, unread message counts, and reviews.
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const isSeller = req.user.role === 'SELLER';
    
    // Retrieve either sold order items or bought order items
    const orders = await prisma.order.findMany({
      where: isSeller ? { sellerId: req.user.id } : { buyerId: req.user.id },
      include: {
        gig: { select: { title: true, images: true } },
        package: true,
        buyer: { select: { id: true, name: true, profileImage: true } },
        seller: { select: { id: true, name: true, profileImage: true } },
        review: true,
        _count: { select: { messages: true } }, // simple message count representation
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/orders/:id
 * Detailed order monitoring:
 * Includes conversation histories between buyers/sellers linked to the order room.
 * Authorizes user identity before releasing payloads.
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        gig: true,
        package: true,
        buyer: { select: { id: true, name: true, profileImage: true } },
        seller: { select: { id: true, name: true, profileImage: true, bio: true } },
        messages: { 
          include: { sender: { select: { id: true, name: true, profileImage: true } } }, 
          orderBy: { createdAt: 'asc' } 
        },
        review: true,
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Authorization Check: prevent external users from reading chat and transaction histories
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Transition order stages:
 * Updates execution phases. Both participant user profiles are authorized.
 */
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    
    // Authorization: only the direct buyer or seller of the order is allowed to modify the status
    if (order.sellerId !== req.user.id && order.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/orders/:id/review
 * Rate and review completed orders:
 * Restricts posting to the buyer of the order, and only when status is 'COMPLETED'.
 */
router.post('/:id/review', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.buyerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    
    // Business Logic check: cannot review pending, active, or cancelled gigs
    if (order.status !== 'COMPLETED') return res.status(400).json({ error: 'Order not completed' });

    const review = await prisma.review.create({ data: { orderId: req.params.id, rating, comment } });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
