import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { 
  asyncHandler, 
  validateRequired, 
  checkResourceExists,
  checkResourceAccess,
  NotFoundError,
  ValidationError,
  UnauthorizedError
} from '../middleware/errorHandler.js';

// Get all chats for a user
export const getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  // Find all chats where the user is a participant
  const chats = await Chat.find({ participants: userId })
    .populate('participants', 'name email profilePicUrl')
    .populate('neighborhoodId', 'name')
    .sort({ lastMessage: -1 });
  
  res.status(200).json({
    success: true,
    chats
  });
});

// Get chat by ID
export const getChatById = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  
  // Find the chat and verify user is a participant
  const chat = await Chat.findOne({ 
    _id: chatId,
    participants: userId 
  })
  .populate('participants', 'name email profilePicUrl')
  .populate('messages.sender', 'name profilePicUrl');
  
  if (!chat) {
    throw new NotFoundError('Chat');
  }
  
  res.status(200).json({
    success: true,
    chat
  });
});

// Create a new chat
export const createChat = asyncHandler(async (req, res) => {
  const { participantIds, isGroupChat, groupName } = req.body;
  const userId = req.user._id;
  
  // Validate required fields
  validateRequired(req.body, ['participantIds']);

  // Validate participantIds is an array
  if (!Array.isArray(participantIds)) {
    throw new ValidationError('participantIds must be an array');
  }

  // Get current user's info
  const currentUser = await checkResourceExists(User, userId);
  
  // Ensure all participants are included
  const allParticipants = [...new Set([...participantIds, userId])];
  
  // Check if a direct chat already exists between these users
  if (!isGroupChat && allParticipants.length === 2) {
    const existingChat = await Chat.findOne({
      participants: { $all: allParticipants },
      isGroupChat: false
    });
    
    if (existingChat) {
      return res.status(200).json({
        success: true,
        chat: existingChat
      });
    }
  }
  
  // Create a new chat
  const newChat = new Chat({
    participants: allParticipants,
    neighborhoodId: currentUser.neighborhoodId,
    isGroupChat: isGroupChat || false,
    groupName: groupName || ''
  });
  
  await newChat.save();
  
  // Populate participant details
  const populatedChat = await Chat.findById(newChat._id)
    .populate('participants', 'name email profilePicUrl');
  
  res.status(201).json({
    success: true,
    chat: populatedChat
  });
});

// Send a message in a chat
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  
  // Validate required fields
  validateRequired(req.body, ['content']);

  // Find the chat and verify user is a participant
  const chat = await Chat.findOne({ 
    _id: chatId,
    participants: userId 
  });
  
  if (!chat) {
    throw new NotFoundError('Chat');
  }
  
  // Add the new message
  chat.messages.push({
    sender: userId,
    content
  });
  
  // Update the lastMessage timestamp
  chat.lastMessage = Date.now();
  
  await chat.save();
  
  // Populate the sender details for the new message
  const updatedChat = await Chat.findById(chatId)
    .populate('participants', 'name email profilePicUrl')
    .populate('messages.sender', 'name profilePicUrl');
  
  // Get the newly added message
  const newMessage = updatedChat.messages[updatedChat.messages.length - 1];
  
  res.status(201).json({
    success: true,
    chat: updatedChat,
    message: newMessage
  });
});

// Mark messages as read
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  
  // Find the chat and verify user is a participant
  const chat = await Chat.findOne({ 
    _id: chatId,
    participants: userId 
  });
  
  if (!chat) {
    throw new NotFoundError('Chat');
  }
  
  // Mark all unread messages as read
  chat.messages.forEach(message => {
    if (!message.read && message.sender.toString() !== userId) {
      message.read = true;
    }
  });
  
  await chat.save();
  
  res.status(200).json({ 
    success: true,
    message: 'Messages marked as read' 
  });
});

// Delete a chat
export const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  
  // Find the chat and verify user is a participant
  const chat = await Chat.findOne({ 
    _id: chatId,
    participants: userId 
  });
  
  if (!chat) {
    throw new NotFoundError('Chat');
  }
  
  await Chat.findByIdAndDelete(chatId);
  
  res.status(200).json({ 
    success: true,
    message: 'Chat deleted successfully' 
  });
});