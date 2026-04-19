import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const includeParticipants = {
  buyer: { select: { id: true, name: true, profileImage: true, role: true } },
  seller: { select: { id: true, name: true, profileImage: true, role: true } },
  directMessages: {
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: { sender: { select: { id: true, name: true } } },
  },
};

// GET /api/conversations — list all direct conversations for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
      },
      include: includeParticipants,
      orderBy: { updatedAt: 'desc' },
    });
    res.json(conversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/conversations — start or get a conversation with another user
router.post('/', authenticate, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });
    if (targetUserId === req.user.id) return res.status(400).json({ error: 'Cannot message yourself' });

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Determine buyer/seller based on roles
    const currentIsBuyer = req.user.role === 'BUYER';
    const buyerId = currentIsBuyer ? req.user.id : targetUserId;
    const sellerId = currentIsBuyer ? targetUserId : req.user.id;

    // Upsert — find existing or create new
    const conversation = await prisma.conversation.upsert({
      where: { buyerId_sellerId: { buyerId, sellerId } },
      update: {},
      create: { buyerId, sellerId },
      include: includeParticipants,
    });

    res.json(conversation);
  } catch (err) {
    console.error('Create conversation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/conversations/:id — get messages for a conversation
router.get('/:id', authenticate, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = await prisma.directMessage.findMany({
      where: { conversationId: req.params.id },
      include: { sender: { select: { id: true, name: true, profileImage: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err) {
    console.error('Get direct messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/conversations/:id/messages — HTTP fallback message send
router.post('/:id/messages', authenticate, async (req, res) => {
  const text = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!text) return res.status(400).json({ error: 'Message is required' });

  try {
    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [saved] = await prisma.$transaction([
      prisma.directMessage.create({
        data: { conversationId: req.params.id, senderId: req.user.id, message: text },
        include: { sender: { select: { id: true, name: true, profileImage: true } } },
      }),
      prisma.conversation.update({
        where: { id: req.params.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    res.status(201).json(saved);
  } catch (err) {
    console.error('Send direct message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
