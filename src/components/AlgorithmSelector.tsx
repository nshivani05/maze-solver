import React from 'react';
import { Algorithm, AlgorithmInfo } from '../types/maze';
import { Play, Info, LucideIcon } from 'lucide-react';

interface Props {
  selectedAlgorithm: Algorithm;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  onSolve: () => void;
  isRunning: boolean;
  showInfo: boolean;
  onToggleInfo: () => void;
}

const algorithmInfo: Record<Algorithm, AlgorithmInfo> = {
  astar: {
    name: 'A* Search',
    description: 'Uses heuristics to find optimal path efficiently',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    optimal: true,
    complete: true
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: 'Guarantees shortest path, explores uniformly',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    optimal: true,
    complete: true
  },
  bfs: {
    name: 'Breadth-First Search',
    description: 'Explores level by level, guarantees shortest path',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    optimal: true,
    complete: true
  },
  dfs: {
    name: 'Depth-First Search',
    description: 'Explores as far as possible before backtracking',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    optimal: false,
    complete: true
  },
  bidirectional: {
    name: 'Bidirectional Search',
    description: 'Searches from both start and end simultaneously',
    timeComplexity: 'O(b^(d/2))',
    spaceComplexity: 'O(b^(d/2))',
    optimal: true,
    complete: true
  }
};

export default function AlgorithmSelector({ 
  selectedAlgorithm, 
  onAlgorithmChange, 
  onSolve, 
  isRunning,
  showInfo,
  onToggleInfo 
}: Props) {
  const currentAlgorithm = algorithmInfo[selectedAlgorithm];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Algorithm Selection</h3>
        <button
          onClick={onToggleInfo}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          title="Algorithm Information"
        >
          <Info size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(algorithmInfo).map(([key, info]) => (
          <button
            key={key}
            onClick={() => onAlgorithmChange(key as Algorithm)}
            disabled={isRunning}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedAlgorithm === key
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="font-medium">{info.name}</div>
            {showInfo && (
              <p className="text-xs text-gray-600 mt-1">
                {info.description}
              </p>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onSolve}
        disabled={isRunning}
        className="mt-4 w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
      >
        <Play size={18} />
        Solve
      </button>
    </div>
  );
}
