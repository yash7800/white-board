import mockDB from '../mockDatabase.js';

const activeConnections = new Map();

export const handleConnection = (io, socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId) => {
    try {
      const cleanRoomId = roomId.trim().toUpperCase();

      // Leave previous room
      if (activeConnections.has(socket.id)) {
        const previousRoom = activeConnections.get(socket.id);
        socket.leave(previousRoom);
        await mockDB.decrementActiveUsers(previousRoom, socket.id);
        socket.to(previousRoom).emit('user-left', { userId: socket.id });
      }

      socket.join(cleanRoomId);
      activeConnections.set(socket.id, cleanRoomId);

      let room = await mockDB.findRoom(cleanRoomId);
      if (!room) {
        room = await mockDB.createRoom(cleanRoomId);
      }

      room = await mockDB.incrementActiveUsers(cleanRoomId, socket.id);

      // Send data to joining user
      socket.emit('room-joined', {
        userId: socket.id,
        activeUsers: room.activeUsers,
        drawingData: room.drawingData
      });

      // Notify others
      socket.to(cleanRoomId).emit('user-joined', {
        userId: socket.id,
        activeUsers: room.activeUsers
      });

      console.log(`User ${socket.id} joined room ${cleanRoomId}`);
    } catch (err) {
      console.error('Join error:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('cursor-move', (data) => {
    const roomId = activeConnections.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('cursor-update', {
        userId: socket.id,
        x: data.x,
        y: data.y,
        color: data.color || '#000000'
      });
    }
  });

  socket.on('draw-start', async (data) => {
    const roomId = activeConnections.get(socket.id);
    if (roomId) {
      await mockDB.addDrawingData(roomId, {
        type: 'stroke',
        data: { action: 'start', ...data }
      });
      socket.to(roomId).emit('draw-start', { userId: socket.id, ...data });
    }
  });

  socket.on('draw-move', async (data) => {
    const roomId = activeConnections.get(socket.id);
    if (roomId) {
      await mockDB.addDrawingData(roomId, {
        type: 'stroke',
        data: { action: 'move', ...data }
      });
      socket.to(roomId).emit('draw-move', { userId: socket.id, ...data });
    }
  });

  socket.on('draw-end', async () => {
    const roomId = activeConnections.get(socket.id);
    if (roomId) {
      await mockDB.addDrawingData(roomId, {
        type: 'stroke',
        data: { action: 'end' }
      });
      socket.to(roomId).emit('draw-end', { userId: socket.id });
    }
  });

  socket.on('clear-canvas', async () => {
    const roomId = activeConnections.get(socket.id);
    if (roomId) {
      await mockDB.clearDrawingData(roomId);
      io.to(roomId).emit('canvas-cleared');
    }
  });

  socket.on('leave-room', async () => {
    await handleUserLeave(socket);
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    await handleUserLeave(socket);
  });
};

const handleUserLeave = async (socket) => {
  const roomId = activeConnections.get(socket.id);
  if (roomId) {
    socket.leave(roomId);
    activeConnections.delete(socket.id);
    const room = await mockDB.decrementActiveUsers(roomId, socket.id);

    socket.to(roomId).emit('user-left', {
      userId: socket.id,
      activeUsers: room ? room.activeUsers : 0
    });

    console.log(`User ${socket.id} left room ${roomId}`);
  }
};
