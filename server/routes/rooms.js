import express from 'express';
import mockDB from '../mockDatabase.js';

const router = express.Router();

// Join or create a room
router.post('/join', async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Room ID is required and must be a non-empty string' 
      });
    }

    const cleanRoomId = roomId.trim().toUpperCase();
    
    // Check if room exists
    let room = await mockDB.findRoom(cleanRoomId);
    
    if (!room) {
      // Create new room
      room = await mockDB.createRoom(cleanRoomId);
    }

    // Increment active users
    room = await mockDB.incrementActiveUsers(cleanRoomId);

    res.json({
      success: true,
      room: {
        id: room.roomId,
        createdAt: room.createdAt,
        activeUsers: room.activeUsers
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get room information
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const cleanRoomId = roomId.trim().toUpperCase();
    
    const room = await mockDB.findRoom(cleanRoomId);
    
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        error: 'Room not found' 
      });
    }

    res.json({
      success: true,
      room: {
        id: room.roomId,
        createdAt: room.createdAt,
        activeUsers: room.activeUsers,
        drawingData: room.drawingData
      }
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;