import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  neighborhoodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'neighborhoods',
    required: true
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Create indexes for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ neighborhoodId: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;