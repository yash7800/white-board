class MockDatabase {
  constructor() {
    this.rooms = new Map();
    this.userTracker = new Map();
    this.connected = false;
  }

  async connect() {
    this.connected = true;
    console.log('Mock database connected successfully');
  }

  async disconnect() {
    this.connected = false;
    this.rooms.clear();
    this.userTracker.clear();
  }

  async findRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  async createRoom(roomId) {
    const room = {
      roomId,
      createdAt: new Date(),
      lastActivity: new Date(),
      drawingData: [],
      activeUsers: 0
    };
    this.rooms.set(roomId, room);
    this.userTracker.set(roomId, new Set());
    return room;
  }

  async updateRoom(roomId, updates) {
    const room = this.rooms.get(roomId);
    if (room) {
      Object.assign(room, updates, { lastActivity: new Date() });
      this.rooms.set(roomId, room);
      return room;
    }
    return null;
  }

  async addDrawingData(roomId, drawingCommand) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.drawingData.push({ ...drawingCommand, timestamp: new Date() });
      room.lastActivity = new Date();
      return room;
    }
    return null;
  }

  async clearDrawingData(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.drawingData = [];
      room.lastActivity = new Date();
      return room;
    }
    return null;
  }

  async incrementActiveUsers(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (room) {
      const tracker = this.userTracker.get(roomId) || new Set();
      tracker.add(socketId);
      this.userTracker.set(roomId, tracker);
      room.activeUsers = tracker.size;
      room.lastActivity = new Date();
      return room;
    }
    return null;
  }

  async decrementActiveUsers(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (room) {
      const tracker = this.userTracker.get(roomId);
      if (tracker) {
        tracker.delete(socketId);
        room.activeUsers = tracker.size;
      } else {
        room.activeUsers = Math.max(0, room.activeUsers - 1);
      }
      room.lastActivity = new Date();
      return room;
    }
    return null;
  }

  cleanupOldRooms() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.lastActivity < cutoff && room.activeUsers === 0) {
        this.rooms.delete(roomId);
        this.userTracker.delete(roomId);
        console.log(`Cleaned up inactive room: ${roomId}`);
      }
    }
  }
}

const mockDB = new MockDatabase();
setInterval(() => mockDB.cleanupOldRooms(), 60 * 60 * 1000); // every hour

export default mockDB;
