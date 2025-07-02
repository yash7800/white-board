import React from 'react';
import { CursorData } from './Whiteboard';

interface UserCursorsProps {
  cursors: CursorData[];
}

const UserCursors: React.FC<UserCursorsProps> = ({ cursors }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-75 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Cursor Circle */}
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: cursor.color }}
          />
          
          {/* Cursor Tail */}
          <div
            className="absolute top-3 left-2 w-0.5 h-3 rounded-full opacity-60"
            style={{ backgroundColor: cursor.color }}
          />
          
          {/* Pulse Effect */}
          <div
            className="absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: cursor.color }}
          />
        </div>
      ))}
    </div>
  );
};

export default UserCursors;