import { LogOut, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ConnectionStatus from './ConnectionStatus';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';

interface WhiteboardProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export interface DrawingSettings {
  color: string;
  width: number;
}

export interface CursorData {
  userId: string;
  x: number;
  y: number;
  color: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ roomId, onLeaveRoom }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [cursors, setCursors] = useState<CursorData[]>([]);
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    color: '#000000',
    width: 3
  });

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket']
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room-joined', (data) => {
      setUserCount(data.activeUsers);
      // Optional: load previous drawing data here if needed
      // e.g. dispatch drawingData to canvas component
    });

    newSocket.on('user-joined', (data) => {
      setUserCount(data.activeUsers);
    });

    newSocket.on('user-left', (data) => {
      setUserCount(data.activeUsers);
      setCursors(prev => prev.filter(cursor => cursor.userId !== data.userId));
    });

    newSocket.on('cursor-update', (data) => {
      setCursors(prev => {
        const filtered = prev.filter(cursor => cursor.userId !== data.userId);
        return [...filtered, data];
      });
    });

    return () => {
      newSocket.emit('leave-room');
      newSocket.close();
    };
  }, [roomId]);

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
      socket.close();
    }
    onLeaveRoom();
  };

  const handleClearCanvas = () => {
    if (socket) {
      socket.emit('clear-canvas');
    }
  };

  if (!socket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <h1 className="text-lg font-semibold text-gray-900">Room: {roomId}</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{userCount} {userCount === 1 ? 'user' : 'users'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ConnectionStatus isConnected={isConnected} />
            <button
              onClick={handleLeaveRoom}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Toolbar */}
        <Toolbar
          settings={drawingSettings}
          onSettingsChange={setDrawingSettings}
          onClearCanvas={handleClearCanvas}
        />

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <DrawingCanvas
            socket={socket}
            drawingSettings={drawingSettings}
            onCursorMove={(x, y) => {
              if (socket) {
                socket.emit('cursor-move', { x, y, color: drawingSettings.color });
              }
            }}
          />
          <UserCursors cursors={cursors} />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
