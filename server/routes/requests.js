import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create a new request (Buyer only - technically any authenticated user can post)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, category, budget, deliveryTime } = req.body;
    
    if (!title || !description || !category || !budget) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const request = await prisma.gigRequest.create({
      data: {
        title,
        description,
        category,
        budget: parseFloat(budget),
        deliveryTime: parseInt(deliveryTime) || 3,
        buyerId: req.user.id,
      }
    });

    res.status(201).json(request);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get all open requests (For Sellers to browse)
router.get('/', authenticate, async (req, res) => {
  try {
    const requests = await prisma.gigRequest.findMany({
      where: { status: 'OPEN' },
      include: {
        buyer: {
          select: { id: true, name: true, profileImage: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get my requests (For Buyers)
router.get('/my', authenticate, async (req, res) => {
  try {
    const requests = await prisma.gigRequest.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
});

// Delete a request
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.gigRequest.findUnique({ where: { id } });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.buyerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.gigRequest.delete({ where: { id } });
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

export default router;
