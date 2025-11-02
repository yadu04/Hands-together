import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { GoogleGenAI } from "@google/genai";

import connectDB from "./database/database.js";
import userRoutes from "./routes/userRoutes.js";
import neighborhoodRoutes from "./routes/neighborhoodRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import pointsOfInterestRoutes from "./routes/pointsOfInterestRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors()
  // origin: "http://localhost:5173", // Your frontend URL
  // credentials: true,
);
//Middleware
app.use(express.json()); // To parse JSON requests

//chat bot gemini api key
const ai = new GoogleGenAI({
  apiKey: "AIzaSyDxHyGSZPPRmkO3nQu6XS-Er1MyRwg7Rt0",
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using gemini-pro for better compatibility
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        }
      ],
      generationConfig: {
        temperature: 1.0,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 100, // Drastically limiting response length
      },
      systemInstruction: "You are a casual friend texting. Keep responses extremely short (1-2 sentences max). Never ask questions. Never use bullet points or numbered lists. Never use formal language or phrases like 'I'd be happy to help'. Just give direct, simple answers like you're texting a friend. Never explain things in detail - just the key points.",
    });

    // Get response text and apply additional processing
    let reply = result?.text ?? "No response from model.";
    
    // Clean up the response
    reply = reply
      .replace(/^\d+\.\s*\*\*[^*]+\*\*[?:]?\s*/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/\n\n/g, ' ')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/Could you please tell me:/i, '')
      .replace(/Please provide more information about:/i, '')
      .replace(/\?/g, '.')  // Replace questions with statements
      .replace(/Let me know if you need.+$/i, '')
      .replace(/Is there anything else.+$/i, '')
      .replace(/Do you have any other.+$/i, '')
      .trim();
    
    // If still too long, truncate
    if (reply.length > 1500) {
      reply = reply.substring(0,1500).trim() + '...';
    }
    
    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to reach Gemini API." });
  }
});
//Connection to Database
connectDB();
// Test route to create a user
app.use("/api/users", userRoutes);

//To fetch neighborhoods from the database
app.use("/api/neighborhoods", neighborhoodRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/neighborhoods", pointsOfInterestRoutes);
app.use("/api/chats", chatRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// Socket.IO connection handling
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle user authentication and store user info
  socket.on("authenticate", (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
  });

  // Handle new message
  socket.on("send_message", (messageData) => {
    const { chatId, message } = messageData;

    // Broadcast to all users in the chat room
    io.to(chatId).emit("receive_message", message);

    // Send notification to offline users
    if (message.recipients) {
      message.recipients.forEach((recipientId) => {
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("new_message_notification", {
            chatId,
            message: {
              sender: message.sender,
              content: message.content,
              timestamp: message.timestamp,
            },
          });
        }
      });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { chatId, user } = data;
    socket.to(chatId).emit("user_typing", user);
  });

  // Handle stop typing
  socket.on("stop_typing", (data) => {
    const { chatId } = data;
    socket.to(chatId).emit("user_stop_typing");
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
  });
});

httpServer.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
