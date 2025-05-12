import Chat from '../models/Chat.js';
import User from '../models/User.js';

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Verify user exists
    if (!userId) {
      console.error('User ID not found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Fetching chats for user:', userId);
    
    // Find all chats where the user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email profilePicture')
      .populate('neighborhoodId', 'name')
      .sort({ lastMessage: -1 }); // Sort by most recent message
    
    console.log(`Found ${chats.length} chats for user ${userId}`);
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    // Send more detailed error information
    res.status(500).json({ 
      message: 'Failed to fetch chats',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get chat by ID
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    // Find the chat and verify user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId,
      participants: userId 
    })
    .populate('participants', 'name email profilePicture')
    .populate('messages.sender', 'name profilePicture');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or you do not have access' });
    }
    
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
};

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const { participantIds, isGroupChat, groupName } = req.body;
    const userId = req.user._id;
    
    // Get current user's info to get neighborhoodId
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Make sure all participants are included
    const allParticipants = [...new Set([...participantIds, userId])];
    
    // Check if a direct chat already exists between these users
    if (!isGroupChat && allParticipants.length === 2) {
      const existingChat = await Chat.findOne({
        participants: { $all: allParticipants },
        isGroupChat: false
      });
      
      if (existingChat) {
        return res.status(200).json(existingChat);
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
      .populate('participants', 'name email profilePicture');
    
    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    // Find the chat and verify user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId,
      participants: userId 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or you do not have access' });
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
      .populate('participants', 'name email profilePicture')
      .populate('messages.sender', 'name profilePicture');
    
    // Get the newly added message
    const newMessage = updatedChat.messages[updatedChat.messages.length - 1];
    
    res.status(201).json({
      chat: updatedChat,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    // Find the chat and verify user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId,
      participants: userId 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or you do not have access' });
    }
    
    // Mark all unread messages as read
    chat.messages.forEach(message => {
      if (!message.read && message.sender.toString() !== userId) {
        message.read = true;
      }
    });
    
    await chat.save();
    
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    // Find the chat and verify user is a participant
    const chat = await Chat.findOne({ 
      _id: chatId,
      participants: userId 
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or you do not have access' });
    }
    
    await Chat.findByIdAndDelete(chatId);
    
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};