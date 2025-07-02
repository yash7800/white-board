import mongoose from 'mongoose';

const drawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['stroke', 'clear']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  drawingData: [drawingCommandSchema],
  activeUsers: {
    type: Number,
    default: 0
  }
});

// Auto-delete rooms after 24 hours of inactivity
roomSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('Room', roomSchema);