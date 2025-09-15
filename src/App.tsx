import React, { useState, useCallback, useEffect } from 'react';
import { Cell, Algorithm, GenerationAlgorithm, EditMode, AlgorithmResult } from './types/maze';
import { PathfindingAlgorithms } from './utils/algorithms';
import { MazeGenerator } from './utils/mazeGeneration';
import AlgorithmSelector from './components/AlgorithmSelector';
import MazeGrid from './components/MazeGrid';
import Controls from './components/Controls';
import PerformanceMetrics from './components/PerformanceMetrics';
import "./index.css";


import { Brain, Github, BookOpen } from 'lucide-react';

function App() {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('astar');
  const [generationAlgorithm, setGenerationAlgorithm] = useState<GenerationAlgorithm>('recursive');
  const [mazeSize, setMazeSize] = useState(25);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [animationSpeed, setAnimationSpeed] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(true);
  const [results, setResults] = useState<Record<string, AlgorithmResult | null>>({});
  const [showMetrics, setShowMetrics] = useState(false);

  // Initialize maze
  useEffect(() => {
    generateMaze();
  }, []);

  const generateMaze = useCallback(() => {
    let newMaze: Cell[][];
    
    switch (generationAlgorithm) {
      case 'recursive':
        newMaze = MazeGenerator.recursiveBacktracking(mazeSize, mazeSize);
        break;
      case 'prim':
        newMaze = MazeGenerator.prim(mazeSize, mazeSize);
        break;
      case 'kruskal':
        newMaze = MazeGenerator.kruskal(mazeSize, mazeSize);
        break;
      case 'empty':
      default:
        newMaze = MazeGenerator.createEmptyMaze(mazeSize, mazeSize);
        MazeGenerator.addRandomWalls(newMaze, 0.3);
        break;
    }

    // Set start and end positions
    const startX = 1;
    const startY = 1;
    const endX = newMaze[0].length - 2;
    const endY = newMaze.length - 2;

    // Ensure start and end are accessible
    MazeGenerator.ensureStartEndAccessible(newMaze, startX, startY, endX, endY);

    // Set start and end markers
    newMaze[startY][startX].isStart = true;
    newMaze[startY][startX].isWall = false;
    newMaze[endY][endX].isEnd = true;
    newMaze[endY][endX].isWall = false;

    setMaze(newMaze);
    setResults({});
    setShowMetrics(false);
  }, [mazeSize, generationAlgorithm]);

  const clearMaze = useCallback(() => {
    if (maze.length === 0) return;
    
    const clearedMaze = maze.map(row => 
      row.map(cell => ({
        ...cell,
        isWall: false,
        isPath: false,
        isVisited: false,
        isExploring: false,
        gCost: 0,
        hCost: 0,
        fCost: 0,
        parent: null,
        distance: Infinity
      }))
    );
    
    setMaze(clearedMaze);
    setResults({});
    setShowMetrics(false);
  }, [maze]);

  const resetMazeVisualization = useCallback(() => {
    if (maze.length === 0) return;
    
    const resetMaze = maze.map(row =>
      row.map(cell => ({
        ...cell,
        isPath: false,
        isVisited: false,
        isExploring: false,
        gCost: 0,
        hCost: 0,
        fCost: 0,
        parent: null,
        distance: Infinity
      }))
    );
    
    setMaze(resetMaze);
  }, [maze]);

  const handleCellClick = useCallback((x: number, y: number) => {
    if (isRunning || maze.length === 0) return;

    const newMaze = [...maze];
    const cell = newMaze[y][x];

    switch (editMode) {
      case 'wall':
        if (!cell.isStart && !cell.isEnd) {
          cell.isWall = !cell.isWall;
        }
        break;
      case 'start':
        // Remove existing start
        maze.forEach(row => {
          row.forEach(c => { c.isStart = false; });
        });
        cell.isStart = true;
        cell.isWall = false;
        break;
      case 'end':
        // Remove existing end
        maze.forEach(row => {
          row.forEach(c => { c.isEnd = false; });
        });
        cell.isEnd = true;
        cell.isWall = false;
        break;
    }

    setMaze(newMaze);
    setResults({});
    setShowMetrics(false);
  }, [maze, editMode, isRunning]);

  const findStartAndEnd = useCallback(() => {
    let start: Cell | null = null;
    let end: Cell | null = null;

    maze.forEach(row => {
      row.forEach(cell => {
        if (cell.isStart) start = cell;
        if (cell.isEnd) end = cell;
      });
    });

    return { start, end };
  }, [maze]);

  const solveMaze = useCallback(async () => {
    if (isRunning || maze.length === 0) return;

    const { start, end } = findStartAndEnd();
    if (!start || !end) {
      alert('Please set both start and end points!');
      return;
    }

    setIsRunning(true);
    resetMazeVisualization();

    const onProgress = (cell: Cell) => {
      setMaze(prevMaze => {
        const newMaze = [...prevMaze];
        newMaze[cell.y][cell.x] = { ...cell };
        return newMaze;
      });
    };

    try {
      let result: AlgorithmResult;

      switch (selectedAlgorithm) {
        case 'astar':
          result = await PathfindingAlgorithms.aStar(maze, start, end, onProgress, animationSpeed);
          break;
        case 'dijkstra':
          result = await PathfindingAlgorithms.dijkstra(maze, start, end, onProgress, animationSpeed);
          break;
        case 'bfs':
          result = await PathfindingAlgorithms.bfs(maze, start, end, onProgress, animationSpeed);
          break;
        case 'dfs':
          result = await PathfindingAlgorithms.dfs(maze, start, end, onProgress, animationSpeed);
          break;
        case 'bidirectional':
          result = await PathfindingAlgorithms.bidirectional(maze, start, end, onProgress, animationSpeed);
          break;
        default:
          throw new Error('Unknown algorithm');
      }

      // Highlight the final path
      if (result.success) {
        setMaze(prevMaze => {
          const newMaze = [...prevMaze];
          result.path.forEach(cell => {
            newMaze[cell.y][cell.x].isPath = true;
            newMaze[cell.y][cell.x].isExploring = false;
          });
          return newMaze;
        });
      }

      setResults(prev => ({ ...prev, [selectedAlgorithm]: result }));
      setShowMetrics(true);

    } catch (error) {
      console.error('Error solving maze:', error);
      alert('An error occurred while solving the maze.');
    } finally {
      setIsRunning(false);
    }
  }, [maze, selectedAlgorithm, animationSpeed, isRunning, findStartAndEnd, resetMazeVisualization]);

  const compareAlgorithms = useCallback(async () => {
    if (isRunning || maze.length === 0) return;

    const { start, end } = findStartAndEnd();
    if (!start || !end) {
      alert('Please set both start and end points!');
      return;
    }

    setIsRunning(true);
    setResults({});
    
    const algorithms: Algorithm[] = ['astar', 'dijkstra', 'bfs', 'dfs', 'bidirectional'];
    const newResults: Record<string, AlgorithmResult | null> = {};

    for (const algorithm of algorithms) {
      resetMazeVisualization();
      
      try {
        let result: AlgorithmResult;

        switch (algorithm) {
          case 'astar':
            result = await PathfindingAlgorithms.aStar(maze, start, end, undefined, 0);
            break;
          case 'dijkstra':
            result = await PathfindingAlgorithms.dijkstra(maze, start, end, undefined, 0);
            break;
          case 'bfs':
            result = await PathfindingAlgorithms.bfs(maze, start, end, undefined, 0);
            break;
          case 'dfs':
            result = await PathfindingAlgorithms.dfs(maze, start, end, undefined, 0);
            break;
          case 'bidirectional':
            result = await PathfindingAlgorithms.bidirectional(maze, start, end, undefined, 0);
            break;
          default:
            throw new Error('Unknown algorithm');
        }

        newResults[algorithm] = result;
        
      } catch (error) {
        console.error(`Error with ${algorithm}:`, error);
        newResults[algorithm] = null;
      }
    }

    setResults(newResults);
    setShowMetrics(true);
    setIsRunning(false);
  }, [maze, isRunning, findStartAndEnd, resetMazeVisualization]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Brain className="text-blue-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Advanced Maze Solver
                </h1>
                <p className="text-gray-600 text-sm">
                  Interactive Data Structures & Algorithms Visualizer
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                title="View on GitHub"
              >
                <Github size={24} />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                title="Documentation"
              >
                <BookOpen size={24} />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <AlgorithmSelector
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={setSelectedAlgorithm}
              onSolve={solveMaze}
              isRunning={isRunning}
              showInfo={showAlgorithmInfo}
              onToggleInfo={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
            />
            
            <Controls
              mazeSize={mazeSize}
              onMazeSizeChange={setMazeSize}
              generationAlgorithm={generationAlgorithm}
              onGenerationAlgorithmChange={setGenerationAlgorithm}
              onGenerateMaze={generateMaze}
              onClearMaze={clearMaze}
              editMode={editMode}
              onEditModeChange={setEditMode}
              animationSpeed={animationSpeed}
              onAnimationSpeedChange={setAnimationSpeed}
              isRunning={isRunning}
              onCompareAlgorithms={compareAlgorithms}
            />
          </div>

          {/* Right Column - Maze and Metrics */}
          <div className="lg:col-span-3 space-y-6">
            <MazeGrid
              maze={maze}
              onCellClick={handleCellClick}
              editMode={editMode}
              isRunning={isRunning}
            />
            
            <PerformanceMetrics
              results={results}
              isVisible={showMetrics}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Educational tool for learning pathfinding algorithms and data structures
            </p>
            <p className="text-sm">
              Algorithms: A* Search, Dijkstra's, BFS, DFS, Bidirectional Search | 
              Generation: Recursive Backtracking, Prim's, Kruskal's
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;