import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

dotenv.config();

import authRouter from './routes/auth.js';
import gigsRouter from './routes/gigs.js';
import ordersRouter from './routes/orders.js';
import messagesRouter from './routes/messages.js';
import requestsRouter from './routes/requests.js';
import conversationsRouter from './routes/conversations.js';

const app = express();
const httpServer = createServer(app);

// Prisma v7 automatically loads config from prisma.config.ts
export const prisma = new PrismaClient({});

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5174', 'http://localhost:5175'] : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
const localOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL, ...localOrigins] : localOrigins;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/gigs', gigsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/conversations', conversationsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io chat
const onlineUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, profileImage: true },
    });

    if (!user) return next(new Error('User not found'));
    socket.data.user = user;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Join personal room for background notifications
  socket.join(`user_${socket.data.user.id}`);

  socket.on('join_room', async (roomId) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: roomId },
        select: { buyerId: true, sellerId: true },
      });

      if (!order) return;
      if (order.buyerId !== socket.data.user.id && order.sellerId !== socket.data.user.id) return;

      socket.join(roomId);
    } catch (err) {
      console.error('Join room error:', err);
    }
  });

  socket.on('user_online', () => {
    onlineUsers.set(socket.data.user.id, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  socket.on('send_message', async (data, callback) => {
    const { orderId, message } = data;
    const text = typeof message === 'string' ? message.trim() : '';
    if (!orderId || !text) {
      if (typeof callback === 'function') callback({ ok: false, error: 'Message is required' });
      return;
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, buyerId: true, sellerId: true },
      });

      if (!order) {
        if (typeof callback === 'function') callback({ ok: false, error: 'Order not found' });
        return;
      }
      if (order.buyerId !== socket.data.user.id && order.sellerId !== socket.data.user.id) {
        if (typeof callback === 'function') callback({ ok: false, error: 'Forbidden' });
        return;
      }

      const saved = await prisma.$transaction(async (tx) => {
        const created = await tx.message.create({
          data: {
            orderId,
            senderId: socket.data.user.id,
            message: text,
          },
          include: { 
            sender: { select: { id: true, name: true, profileImage: true } },
            order: { select: { buyerId: true, sellerId: true } }
          },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { updatedAt: new Date() },
        });

        return created;
      });

      // Emit to room for active chat window
      io.to(orderId).emit('new_message', saved);
      
      // Emit to participants for sidebar/background updates
      io.to(`user_${saved.order.buyerId}`).to(`user_${saved.order.sellerId}`).emit('new_message', saved);

      if (typeof callback === 'function') callback({ ok: true, message: saved });
    } catch (err) {
      console.error('Message save error:', err);
      if (typeof callback === 'function') callback({ ok: false, error: 'Message could not be sent' });
    }
  });

  // Direct message room for conversations
  socket.on('join_direct_room', async (conversationId) => {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { buyerId: true, sellerId: true }
      });
      if (!conversation) return;
      if (conversation.buyerId !== socket.data.user.id && conversation.sellerId !== socket.data.user.id) return;
      
      socket.join(`direct_${conversationId}`);
    } catch (err) {
      console.error('Join direct room error:', err);
    }
  });

  socket.on('send_direct_message', async (data, callback) => {
    const { conversationId, message } = data;
    const text = typeof message === 'string' ? message.trim() : '';
    if (!conversationId || !text) {
      if (typeof callback === 'function') callback({ ok: false, error: 'Message is required' });
      return;
    }
    try {
      const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conversation) {
        if (typeof callback === 'function') callback({ ok: false, error: 'Conversation not found' });
        return;
      }
      if (conversation.buyerId !== socket.data.user.id && conversation.sellerId !== socket.data.user.id) {
        if (typeof callback === 'function') callback({ ok: false, error: 'Forbidden' });
        return;
      }
      const [saved] = await prisma.$transaction([
        prisma.directMessage.create({
          data: { conversationId, senderId: socket.data.user.id, message: text },
          include: { 
            sender: { select: { id: true, name: true, profileImage: true } },
            conversation: { select: { buyerId: true, sellerId: true } }
          },
        }),
        prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
      ]);

      // Emit to room for active chat window
      io.to(`direct_${conversationId}`).emit('new_direct_message', saved);

      // Emit to participants for sidebar/background updates
      io.to(`user_${saved.conversation.buyerId}`).to(`user_${saved.conversation.sellerId}`).emit('new_direct_message', saved);

      if (typeof callback === 'function') callback({ ok: true, message: saved });
    } catch (err) {
      console.error('Direct message error:', err);
      if (typeof callback === 'function') callback({ ok: false, error: 'Message could not be sent' });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SkillMint server running on port ${PORT}`);
});
