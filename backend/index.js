/**
 * ==========================================
 * SkillMint Backend - Main Entry Point
 * ==========================================
 * This file serves as the main application server, integrating:
 * 1. Express.js for REST API endpoints.
 * 2. Socket.io for real-time bi-directional messaging.
 * 3. Prisma Client for type-safe database queries.
 * 4. JSON Web Tokens (JWT) for secure authentication.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Load environment variables from backend/.env file
dotenv.config();

// Import express routes for modular routing
import authRouter from './routes/auth.js';
import gigsRouter from './routes/gigs.js';
import ordersRouter from './routes/orders.js';
import messagesRouter from './routes/messages.js';
import requestsRouter from './routes/requests.js';
import conversationsRouter from './routes/conversations.js';

// Initialize the Express application
const app = express();

// Create an HTTP server using the Express app to share port with Socket.io
const httpServer = createServer(app);

// Initialize Prisma Client to connect with Supabase PostgreSQL database
export const prisma = new PrismaClient({});

/**
 * ------------------------------------------
 * Socket.io Server Setup
 * ------------------------------------------
 * Configures the real-time server with proper Cross-Origin Resource Sharing (CORS) rules.
 * Restricts client connections to specified frontend URLs to ensure secure socket connections.
 */
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5174', 'http://localhost:5175'] : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

/**
 * ------------------------------------------
 * Middleware Configurations
 * ------------------------------------------
 * 1. CORS Middleware: Configures permitted HTTP request origins for secure cross-origin requests.
 * 2. JSON Body Parser: Parses incoming requests with JSON payloads (with a 10MB limit for image uploads).
 * 3. URL Encoded Parser: Parses incoming requests with URL-encoded payloads.
 */
const localOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL, ...localOrigins] : localOrigins;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * ------------------------------------------
 * API Routes Definition
 * ------------------------------------------
 * Maps modular routers to their respective base path URL segments.
 */
app.use('/api/auth', authRouter);
app.use('/api/gigs', gigsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/conversations', conversationsRouter);

// Health check endpoint for automated status monitoring (e.g., Render, Uptime trackers)
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

/**
 * ------------------------------------------
 * Real-Time User & Connection Map
 * ------------------------------------------
 * Tracks active socket connections mapping User IDs to Socket IDs.
 * Used for dynamic status checking and routing messages to active clients.
 */
const onlineUsers = new Map();

/**
 * ------------------------------------------
 * Socket.io Authentication Middleware
 * ------------------------------------------
 * Runs before any socket connection is established.
 * 1. Checks if the client handshake contains an authentication token.
 * 2. Decodes the JWT and validates the user existence in Supabase database via Prisma.
 * 3. If valid, attaches the user object to socket.data for easy downstream access.
 */
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

/**
 * ------------------------------------------
 * Socket.io Connections & Event Handling
 * ------------------------------------------
 * Standard connection handler. Executed every time a client connects.
 */
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user's personal private room to receive background notifications/direct calls
  socket.join(`user_${socket.data.user.id}`);

  /**
   * Room Join Listener (Order-Based Communication)
   * Restricts joining order rooms to authorized participants (the specific buyer or seller only).
   */
  socket.on('join_room', async (roomId) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: roomId },
        select: { buyerId: true, sellerId: true },
      });

      if (!order) return;
      // Authorize: check if connecting socket user is the buyer or the seller of this order
      if (order.buyerId !== socket.data.user.id && order.sellerId !== socket.data.user.id) return;

      socket.join(roomId);
    } catch (err) {
      console.error('Join room error:', err);
    }
  });

  /**
   * User Online Announcement Listener
   * Sets the user's online state in the onlineUsers map and broadcasts the list to all clients.
   */
  socket.on('user_online', () => {
    onlineUsers.set(socket.data.user.id, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  /**
   * Send Order Message Listener
   * 1. Validates that the message belongs to a valid order.
   * 2. Authorizes user membership inside the order.
   * 3. Performs a Prisma Transaction: writes the message to the DB and bumps the order's updatedAt timestamp.
   * 4. Broadcasts message to the specific order room and triggers updates for participant's sidebars.
   */
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

      // Execute message write & order timestamp bump as a single database transaction
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

      // Emit to order room for active chat window updates
      io.to(orderId).emit('new_message', saved);

      // Emit to specific users for sidebar list updates and global unread badges
      io.to(`user_${saved.order.buyerId}`).to(`user_${saved.order.sellerId}`).emit('new_message', saved);

      if (typeof callback === 'function') callback({ ok: true, message: saved });
    } catch (err) {
      console.error('Message save error:', err);
      if (typeof callback === 'function') callback({ ok: false, error: 'Message could not be sent' });
    }
  });

  /**
   * Direct Message Room Connection Listener
   * Restricts direct message thread rooms to authorized participants (the specific buyer or seller).
   */
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

  /**
   * Direct Message Transmission Listener
   * 1. Creates a standard non-order direct message in the database.
   * 2. Bumps the conversation's updatedAt timestamp to bring it to the top of list filters.
   * 3. Emits message event to the active chat and the user rooms.
   */
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
      
      // Perform database operations as a combined transaction
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

      // Emit to room for active chat window update
      io.to(`direct_${conversationId}`).emit('new_direct_message', saved);

      // Emit to participants for sidebar/background updates
      io.to(`user_${saved.conversation.buyerId}`).to(`user_${saved.conversation.sellerId}`).emit('new_direct_message', saved);

      if (typeof callback === 'function') callback({ ok: true, message: saved });
    } catch (err) {
      console.error('Direct message error:', err);
      if (typeof callback === 'function') callback({ ok: false, error: 'Message could not be sent' });
    }
  });

  /**
   * Connection Cleanup & Disconnect Listener
   * Removes user from online list upon disconnect and broadcasts the updated online list.
   */
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

/**
 * ------------------------------------------
 * Server Initiation
 * ------------------------------------------
 * Listens on designated port (env.PORT or port 5000 fallback).
 */
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SkillMint server running on port ${PORT}`);
});
