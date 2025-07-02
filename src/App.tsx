import { useState } from 'react';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import './index.css';

function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {!currentRoom ? (
        <RoomJoin onJoinRoom={handleJoinRoom} />
      ) : (
        <Whiteboard roomId={currentRoom} onLeaveRoom={handleLeaveRoom} />
      )}
    </div>
  );
}

export default App;
