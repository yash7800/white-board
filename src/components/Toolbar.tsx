import React from 'react';
import { Palette, Minus, Plus, Eraser } from 'lucide-react';
import { DrawingSettings } from './Whiteboard';

interface ToolbarProps {
  settings: DrawingSettings;
  onSettingsChange: (settings: DrawingSettings) => void;
  onClearCanvas: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  onSettingsChange,
  onClearCanvas,
}) => {
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Yellow', value: '#F59E0B' },
  ];

  const widths = [1, 2, 3, 5, 8, 12];

  const handleColorChange = (color: string) => {
    onSettingsChange({ ...settings, color });
  };

  const handleWidthChange = (width: number) => {
    onSettingsChange({ ...settings, width });
  };

  return (
    <div className="w-20 bg-white shadow-lg border-r border-gray-200 flex flex-col items-center py-6 space-y-6">
      {/* Color Palette */}
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <Palette className="w-5 h-5 text-gray-600" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                settings.color === color.value
                  ? 'border-gray-800 ring-2 ring-gray-300'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-3">
        <div className="text-xs text-gray-600 text-center">Width</div>
        <div className="space-y-2">
          {widths.map((width) => (
            <button
              key={width}
              onClick={() => handleWidthChange(width)}
              className={`w-12 h-8 flex items-center justify-center rounded-md transition-colors ${
                settings.width === width
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
              title={`${width}px`}
            >
              <div
                className="rounded-full bg-gray-800"
                style={{
                  width: `${Math.min(width * 2, 16)}px`,
                  height: `${Math.min(width * 2, 16)}px`,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClearCanvas}
          className="w-12 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200"
          title="Clear Canvas"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;