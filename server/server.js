import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import roomRoutes from './routes/rooms.js';
import { handleConnection } from './socket/socketHandlers.js';
import mockDB from './mockDatabase.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? "http://localhost:5173" : "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Mock Database (In-Memory)'
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  handleConnection(io, socket);
});

// Mock database connection
const connectDB = async () => {
  try {
    await mockDB.connect();
    console.log('Mock database connected successfully');
    console.log('Note: Using in-memory storage instead of MongoDB for WebContainer compatibility');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3001;

// Start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Database: In-memory mock database');
  });
};

startServer();