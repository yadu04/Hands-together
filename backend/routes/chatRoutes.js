import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserChats,
  getChatById,
  createChat,
  sendMessage,
  markMessagesAsRead,
  deleteChat
} from '../controllers/chatController.js';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(protect);

// Get all chats for the current user
router.get('/', getUserChats);

// Get a specific chat by ID
router.get('/:chatId', getChatById);

// Create a new chat
router.post('/', createChat);

// Send a message in a chat
router.post('/:chatId/messages', sendMessage);

// Mark messages as read
router.put('/:chatId/read', markMessagesAsRead);

// Delete a chat
router.delete('/:chatId', deleteChat);

export default router;