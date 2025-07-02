# Collaborative Whiteboard Application

A real-time collaborative whiteboard built with the MERN stack, featuring live drawing synchronization, cursor tracking, and room-based collaboration.

## Features

- **Real-time Collaboration**: Multiple users can draw simultaneously with instant synchronization
- **Live Cursor Tracking**: See other users' cursors moving in real-time with unique colors
- **Room-based Sessions**: Join or create rooms with simple alphanumeric codes
- **Drawing Tools**: Adjustable stroke width and color selection
- **Canvas Persistence**: Drawing data is saved to MongoDB and restored when joining rooms
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Clean Interface**: Modern, intuitive UI focused on the drawing experience

## Technology Stack

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **Socket.io-client** for real-time communication
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **Socket.io** for WebSocket connections
- **MongoDB** with Mongoose for data persistence
- **CORS** and **Helmet** for security

## Architecture Overview

```
├── client/ (React Frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── RoomJoin.tsx          # Room code input interface
│   │   │   ├── Whiteboard.tsx        # Main whiteboard container
│   │   │   ├── DrawingCanvas.tsx     # HTML5 Canvas with drawing logic
│   │   │   ├── Toolbar.tsx           # Drawing tools and controls
│   │   │   ├── UserCursors.tsx       # Display other users' cursors
│   │   │   └── ConnectionStatus.tsx  # Connection indicator
│   │   └── App.tsx
├── server/ (Node.js Backend)
│   ├── models/
│   │   └── Room.js                   # MongoDB room schema
│   ├── routes/
│   │   └── rooms.js                  # REST API endpoints
│   ├── socket/
│   │   └── socketHandlers.js         # Socket.io event handlers
│   └── server.js                     # Express server setup
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Development Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   npm run install-server
   ```

2. **Configure MongoDB:**
   - For local MongoDB: Ensure MongoDB is running on `mongodb://localhost:27017`
   - For MongoDB Atlas: Update the `MONGODB_URI` in `server/.env`

3. **Environment Configuration:**
   ```bash
   # server/.env
   MONGODB_URI=mongodb://localhost:27017/collaborative-whiteboard
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```
   This will start both the React frontend (http://localhost:5173) and the Node.js backend (http://localhost:3001)

### Production Build

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   cd server
   npm start
   ```

## API Documentation

### REST Endpoints

#### POST /api/rooms/join
Join or create a room.

**Request Body:**
```json
{
  "roomId": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "room": {
    "id": "ABC123",
    "createdAt": "2025-01-02T...",
    "activeUsers": 1
  }
}
```

#### GET /api/rooms/:roomId
Get room information and drawing data.

**Response:**
```json
{
  "room": {
    "id": "ABC123",
    "createdAt": "2025-01-02T...",
    "activeUsers": 2,
    "drawingData": [...]
  }
}
```

### Socket Events

#### Client → Server Events
- `join-room`: Join a specific room
- `leave-room`: Leave the current room
- `cursor-move`: Send cursor position updates
- `draw-start`: Start a new drawing stroke
- `draw-move`: Continue drawing stroke
- `draw-end`: End current drawing stroke
- `clear-canvas`: Clear the entire canvas

#### Server → Client Events
- `user-joined`: New user joined the room
- `user-left`: User left the room
- `cursor-update`: Other user's cursor position
- `draw-start`: Other user started drawing
- `draw-move`: Other user's drawing data
- `draw-end`: Other user finished drawing
- `canvas-cleared`: Canvas was cleared
- `load-drawing`: Initial drawing data when joining

## Database Schema

### Room Collection
```javascript
{
  roomId: String (unique, indexed),
  createdAt: Date,
  lastActivity: Date,
  drawingData: [DrawingCommand],
  activeUsers: Number
}
```

### Drawing Command Schema
```javascript
{
  type: String, // 'stroke' or 'clear'
  data: {
    action: String, // 'start' or 'move'
    x: Number,
    y: Number,
    color: String,
    width: Number
  },
  timestamp: Date
}
```

## Performance Optimizations

- **Throttled cursor updates**: Limited to ~60fps to prevent server overload
- **Efficient drawing synchronization**: Only sends incremental drawing data
- **Automatic room cleanup**: Inactive rooms are deleted after 24 hours
- **Canvas optimization**: Uses devicePixelRatio for crisp rendering
- **Connection management**: Proper cleanup of socket connections and user tracking

## Deployment Guide

### Using MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Update the connection string in `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collaborative-whiteboard
   ```

### Using Heroku

1. **Prepare the application:**
   ```bash
   # Add a Procfile in the root directory
   echo "web: cd server && npm start" > Procfile
   ```

2. **Deploy to Heroku:**
   ```bash
   heroku create your-app-name
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

3. **Update frontend configuration:**
   - Change the Socket.io connection URL from `localhost:3001` to your Heroku app URL
   - Update API endpoints to use the production server URL

### Environment Variables

Required environment variables for production:

```bash
MONGODB_URI=your_mongodb_connection_string
PORT=3001
NODE_ENV=production
```

## Browser Support

- Modern browsers with HTML5 Canvas support
- WebSocket support required
- Tested on Chrome, Firefox, Safari, and Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.