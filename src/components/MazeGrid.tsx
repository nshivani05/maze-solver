import React, { useCallback } from 'react';
import { Cell, EditMode } from '../types/maze';
import { MapPin, Target, Square, Navigation } from 'lucide-react';

interface Props {
  maze: Cell[][];
  onCellClick: (x: number, y: number) => void;
  editMode: EditMode;
  isRunning: boolean;
}

export default function MazeGrid({ maze, onCellClick, editMode, isRunning }: Props) {
  const handleCellClick = useCallback((x: number, y: number) => {
    if (!isRunning) {
      onCellClick(x, y);
    }
  }, [onCellClick, isRunning]);

  const getCellClassName = (cell: Cell) => {
    const baseClasses = "w-full h-full border border-gray-100 transition-all duration-200 cursor-pointer flex items-center justify-center";
    
    if (cell.isStart) {
      return `${baseClasses} bg-green-500 text-white shadow-lg transform scale-110`;
    }
    if (cell.isEnd) {
      return `${baseClasses} bg-red-500 text-white shadow-lg transform scale-110`;
    }
    if (cell.isPath) {
      return `${baseClasses} bg-yellow-400 shadow-md animate-pulse`;
    }
    if (cell.isExploring) {
      return `${baseClasses} bg-blue-300 animate-pulse`;
    }
    if (cell.isVisited) {
      return `${baseClasses} bg-blue-100`;
    }
    if (cell.isWall) {
      return `${baseClasses} bg-gray-800 hover:bg-gray-700`;
    }
    
    return `${baseClasses} bg-white hover:bg-gray-50`;
  };

  const getCellIcon = (cell: Cell) => {
    if (cell.isStart) return <MapPin size={12} />;
    if (cell.isEnd) return <Target size={12} />;
    if (cell.isPath) return <Navigation size={10} />;
    if (cell.isWall) return <Square size={8} className="opacity-50" />;
    return null;
  };

  if (!maze.length) return null;

  const cellSize = Math.min(600 / maze[0].length, 600 / maze.length, 20);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Maze Visualization</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>End</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>Path</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-300 rounded"></div>
            <span>Exploring</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-800 rounded"></div>
            <span>Wall</span>
          </div>
        </div>
      </div>

      <div 
        className="grid gap-0.5 mx-auto border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${maze[0].length}, minmax(0, 1fr))`,
          width: `${Math.min(600, maze[0].length * cellSize)}px`,
          height: `${Math.min(600, maze.length * cellSize)}px`,
        }}
      >
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={getCellClassName(cell)}
              onClick={() => handleCellClick(x, y)}
              style={{ 
                minHeight: `${cellSize}px`,
                minWidth: `${cellSize}px`
              }}
            >
              {getCellIcon(cell)}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600 text-center">
        Current Mode: <span className="font-semibold capitalize">{editMode}</span>
        {editMode !== 'none' && (
          <span className="ml-2 text-blue-600">Click cells to edit</span>
        )}
      </div>
    </div>
  );
}