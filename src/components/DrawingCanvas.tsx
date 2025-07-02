import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { DrawingSettings } from './Whiteboard';

interface DrawingCanvasProps {
  socket: Socket;
  drawingSettings: DrawingSettings;
  onCursorMove: (x: number, y: number) => void;
}

interface DrawPoint {
  x: number;
  y: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  socket,
  drawingSettings,
  onCursorMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawPoint[]>([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Configure context
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;
    
    contextRef.current = context;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    const handleDrawStart = (data: { x: number; y: number; color: string; width: number }) => {
      const context = contextRef.current;
      if (!context) return;

      context.strokeStyle = data.color;
      context.lineWidth = data.width;
      context.beginPath();
      context.moveTo(data.x, data.y);
    };

    const handleDrawMove = (data: { x: number; y: number }) => {
      const context = contextRef.current;
      if (!context) return;

      context.lineTo(data.x, data.y);
      context.stroke();
    };

    const handleDrawEnd = () => {
      const context = contextRef.current;
      if (!context) return;

      context.closePath();
    };

    const handleCanvasCleared = () => {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (!context || !canvas) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleLoadDrawing = (drawingData: any[]) => {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (!context || !canvas) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Replay drawing commands
      drawingData.forEach((command) => {
        if (command.type === 'clear') {
          context.clearRect(0, 0, canvas.width, canvas.height);
        } else if (command.type === 'stroke') {
          const { action, x, y, color, width } = command.data;
          
          if (action === 'start') {
            context.strokeStyle = color;
            context.lineWidth = width;
            context.beginPath();
            context.moveTo(x, y);
          } else if (action === 'move') {
            context.lineTo(x, y);
            context.stroke();
          }
        }
      });
    };

    socket.on('draw-start', handleDrawStart);
    socket.on('draw-move', handleDrawMove);
    socket.on('draw-end', handleDrawEnd);
    socket.on('canvas-cleared', handleCanvasCleared);
    socket.on('load-drawing', handleLoadDrawing);

    return () => {
      socket.off('draw-start', handleDrawStart);
      socket.off('draw-move', handleDrawMove);
      socket.off('draw-end', handleDrawEnd);
      socket.off('canvas-cleared', handleCanvasCleared);
      socket.off('load-drawing', handleLoadDrawing);
    };
  }, [socket]);

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const coordinates = getCanvasCoordinates(event);
    const context = contextRef.current;
    
    if (!context) return;

    setIsDrawing(true);
    setCurrentPath([coordinates]);

    context.strokeStyle = drawingSettings.color;
    context.lineWidth = drawingSettings.width;
    context.beginPath();
    context.moveTo(coordinates.x, coordinates.y);

    socket.emit('draw-start', {
      x: coordinates.x,
      y: coordinates.y,
      color: drawingSettings.color,
      width: drawingSettings.width,
    });
  }, [socket, drawingSettings]);

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      // Just track cursor movement
      const coordinates = getCanvasCoordinates(event);
      onCursorMove(coordinates.x, coordinates.y);
      return;
    }

    const coordinates = getCanvasCoordinates(event);
    const context = contextRef.current;
    
    if (!context) return;

    context.lineTo(coordinates.x, coordinates.y);
    context.stroke();

    setCurrentPath(prev => [...prev, coordinates]);

    socket.emit('draw-move', {
      x: coordinates.x,
      y: coordinates.y,
    });

    onCursorMove(coordinates.x, coordinates.y);
  }, [isDrawing, socket, onCursorMove]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    const context = contextRef.current;
    if (context) {
      context.closePath();
    }

    setIsDrawing(false);
    setCurrentPath([]);
    socket.emit('draw-end');
  }, [isDrawing, socket]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair bg-white"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default DrawingCanvas;