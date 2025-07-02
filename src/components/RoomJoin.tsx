import React, { useState } from 'react';
import { Users, Palette, Zap } from 'lucide-react';

interface RoomJoinProps {
  onJoinRoom: (roomId: string) => void;
}

const RoomJoin: React.FC<RoomJoinProps> = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: roomId.trim() }),
      });

      if (response.ok) {
        onJoinRoom(roomId.trim());
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setRoomId(result);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Palette className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Collaborative Whiteboard
          </h1>
          <p className="text-gray-600">
            Create or join a room to start drawing together in real-time
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code (4-8 characters)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-wider"
                maxLength={8}
                disabled={isLoading}
              />
            </div>

            <button
              type="button"
              onClick={generateRandomRoomId}
              className="w-full py-2 px-4 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              disabled={isLoading}
            >
              Generate Random Code
            </button>

            <button
              type="submit"
              disabled={!roomId.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span>Join Room</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Real-time<br />Collaboration</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Live Cursor<br />Tracking</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Palette className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Drawing<br />Tools</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;