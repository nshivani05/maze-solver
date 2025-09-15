import React from 'react';
import { GenerationAlgorithm, EditMode } from '../types/maze';
import { 
  Settings, 
  Shuffle, 
  RotateCcw, 
  Pencil, 
  MapPin, 
  Target,
  Square,
  Eraser,
  Zap,
  BarChart3,
  LucideIcon
} from 'lucide-react';

interface Props {
  mazeSize: number;
  onMazeSizeChange: (size: number) => void;
  generationAlgorithm: GenerationAlgorithm;
  onGenerationAlgorithmChange: (algorithm: GenerationAlgorithm) => void;
  onGenerateMaze: () => void;
  onClearMaze: () => void;
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  isRunning: boolean;
  onCompareAlgorithms: () => void;
}

const generationAlgorithms: Record<GenerationAlgorithm, { name: string; description: string }> = {
  recursive: {
    name: 'Recursive Backtracking',
    description: 'Creates perfect mazes with guaranteed unique solution'
  },
  prim: {
    name: "Prim's Algorithm",
    description: 'Minimum spanning tree approach, creates organic patterns'
  },
  kruskal: {
    name: "Kruskal's Algorithm", 
    description: 'Union-find based generation, very efficient'
  },
  empty: {
    name: 'Empty Grid',
    description: 'Start with blank canvas for manual editing'
  }
};

const editModes: Record<EditMode, { name: string; icon: LucideIcon; color: string }> = {
  wall: { name: 'Draw Walls', icon: Square, color: 'text-gray-700' },
  start: { name: 'Place Start', icon: MapPin, color: 'text-green-600' },
  end: { name: 'Place End', icon: Target, color: 'text-red-600' },
  none: { name: 'View Only', icon: Eraser, color: 'text-blue-600' }
};

export default function Controls({
  mazeSize,
  onMazeSizeChange,
  generationAlgorithm,
  onGenerationAlgorithmChange,
  onGenerateMaze,
  onClearMaze,
  editMode,
  onEditModeChange,
  animationSpeed,
  onAnimationSpeedChange,
  isRunning,
  onCompareAlgorithms
}: Props) {
  return (
    <div className="space-y-6">
      {/* Maze Generation */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="text-purple-600" size={24} />
          Maze Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maze Size: {mazeSize}x{mazeSize}
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={mazeSize}
              onChange={(e) => onMazeSizeChange(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10x10</span>
              <span>50x50</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Generation Algorithm
            </label>
            <select
              value={generationAlgorithm}
              onChange={(e) => onGenerationAlgorithmChange(e.target.value as GenerationAlgorithm)}
              disabled={isRunning}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Object.entries(generationAlgorithms).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              {generationAlgorithms[generationAlgorithm].description}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onGenerateMaze}
              disabled={isRunning}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              <Shuffle size={16} />
              Generate
            </button>
            <button
              onClick={onClearMaze}
              disabled={isRunning}
              className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={16} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Edit Mode */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Pencil className="text-orange-600" size={24} />
          Edit Mode
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(editModes).map(([key, mode]) => {
            const IconComponent = mode.icon;
            return (
              <button
                key={key}
                onClick={() => onEditModeChange(key as EditMode)}
                disabled={isRunning}
                className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  editMode === key
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-200 text-gray-700'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <IconComponent size={16} className={mode.color} />
                <span className="text-sm font-medium">{mode.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animation Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="text-yellow-600" size={24} />
          Animation
        </h3>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Speed: {animationSpeed === 0 ? 'Instant' : `${animationSpeed}ms delay`}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={animationSpeed}
            onChange={(e) => onAnimationSpeedChange(Number(e.target.value))}
            disabled={isRunning}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Instant</span>
            <span>Slow</span>
          </div>
        </div>
      </div>

      {/* Algorithm Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <button
          onClick={onCompareAlgorithms}
          disabled={isRunning}
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
        >
          <BarChart3 size={18} />
          Compare All Algorithms
        </button>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Race all algorithms simultaneously to see performance differences
        </p>
      </div>
    </div>
  );
}
