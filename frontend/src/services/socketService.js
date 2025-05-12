import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (userId) => {
  if (!socket) {
    // Connect to the socket server
    socket = io('http://localhost:8000');
    
    // Authenticate the socket connection with user ID
    if (userId) {
      socket.emit('authenticate', userId);
    }
    
    console.log('Socket initialized');
  }
  return socket;
};

export const joinChatRoom = (chatId) => {
  if (socket) {
    socket.emit('join_chat', chatId);
  }
};

export const sendMessage = (chatId, message) => {
  if (socket) {
    socket.emit('send_message', { chatId, message });
  }
};

export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.on('receive_message', (message) => {
      callback(message);
    });
  }
};

export const onNewMessageNotification = (callback) => {
  if (socket) {
    socket.on('new_message_notification', (data) => {
      callback(data);
    });
  }
};

export const emitTyping = (chatId, user) => {
  if (socket) {
    socket.emit('typing', { chatId, user });
  }
};

export const emitStopTyping = (chatId) => {
  if (socket) {
    socket.emit('stop_typing', { chatId });
  }
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user_typing', (user) => {
      callback(user);
    });
  }
};

export const onUserStopTyping = (callback) => {
  if (socket) {
    socket.on('user_stop_typing', () => {
      callback();
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};