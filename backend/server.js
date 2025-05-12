import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./database/database.js";
import userRoutes from './routes/userRoutes.js';
import neighborhoodRoutes from './routes/neighborhoodRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import postRoutes from './routes/postRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import pointsOfInterestRoutes from './routes/pointsOfInterestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();
const app = express();

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
//Middleware
app.use(express.json()); // To parse JSON requests
//Connection to Database 
connectDB();
// Test route to create a user
app.use('/api/users', userRoutes);

//To fetch neighborhoods from the database
app.use('/api/neighborhoods', neighborhoodRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/neighborhoods', pointsOfInterestRoutes);
app.use('/api/chats', chatRoutes);

const PORT = process.env.PORT || 8000;

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle user authentication and store user info
  socket.on('authenticate', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Join a chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
  });

  // Handle new message
  socket.on('send_message', (messageData) => {
    const { chatId, message } = messageData;
    
    // Broadcast to all users in the chat room
    io.to(chatId).emit('receive_message', message);
    
    // Send notification to offline users
    if (message.recipients) {
      message.recipients.forEach(recipientId => {
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_message_notification', {
            chatId,
            message: {
              sender: message.sender,
              content: message.content,
              timestamp: message.timestamp
            }
          });
        }
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { chatId, user } = data;
    socket.to(chatId).emit('user_typing', user);
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    const { chatId } = data;
    socket.to(chatId).emit('user_stop_typing');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
  });
});

httpServer.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))