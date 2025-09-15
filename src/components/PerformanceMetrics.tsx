import React from 'react';
import { AlgorithmResult } from '../types/maze';
import { Clock, Route, Search, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface Props {
  results: Record<string, AlgorithmResult | null>;
  isVisible: boolean;
}

export default function PerformanceMetrics({ results, isVisible }: Props) {
  if (!isVisible) return null;

  const validResults = Object.entries(results).filter(([_, result]) => result !== null);
  
  if (validResults.length === 0) return null;

  const bestTime = Math.min(...validResults.map(([_, result]) => result!.executionTime));
  const shortestPath = Math.min(...validResults.filter(([_, result]) => result!.success).map(([_, result]) => result!.pathLength));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Trophy className="text-yellow-600" size={24} />
        Performance Analysis
      </h3>
      
      <div className="space-y-4">
        {validResults.map(([algorithm, result]) => {
          if (!result) return null;
          
          const isFastest = result.executionTime === bestTime;
          const isOptimal = result.success && result.pathLength === shortestPath;
          
          return (
            <div key={algorithm} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 capitalize flex items-center gap-2">
                  {algorithm.replace('_', ' ')}
                  {result.success ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                  {isFastest && <Trophy size={16} className="text-yellow-500" />}
                  {isOptimal && <Route size={16} className="text-blue-500" />}
                </h4>
                <span className={`text-sm px-2 py-1 rounded ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-600" />
                  <div>
                    <div className="font-medium">{result.executionTime.toFixed(2)}ms</div>
                    <div className="text-gray-500 text-xs">Execution Time</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Route size={14} className="text-green-600" />
                  <div>
                    <div className="font-medium">{result.pathLength}</div>
                    <div className="text-gray-500 text-xs">Path Length</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-purple-600" />
                  <div>
                    <div className="font-medium">{result.nodesExplored}</div>
                    <div className="text-gray-500 text-xs">Nodes Explored</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">
                      {result.success ? (result.nodesExplored / result.pathLength).toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-gray-500 text-xs">Efficiency Ratio</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Key Insights</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Fastest:</strong> Algorithm with lowest execution time</li>
          <li>• <strong>Optimal Path:</strong> Algorithm that found shortest solution</li>
          <li>• <strong>Efficiency Ratio:</strong> Nodes explored per path length (lower is better)</li>
          <li>• <strong>A*</strong> typically balances speed and optimality best</li>
        </ul>
      </div>
    </div>
  );
}