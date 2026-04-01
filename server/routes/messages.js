import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/messages/:orderId - get messages for an order
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const messages = await prisma.message.findMany({
      where: { orderId: req.params.orderId },
      include: { sender: { select: { id: true, name: true, profileImage: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
