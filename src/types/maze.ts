export interface Cell {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isPath: boolean;
  isVisited: boolean;
  isExploring: boolean;
  gCost: number;
  hCost: number;
  fCost: number;
  parent: Cell | null;
  distance: number;
}

export interface MazeConfig {
  width: number;
  height: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface AlgorithmResult {
  path: Cell[];
  visitedNodes: Cell[];
  executionTime: number;
  pathLength: number;
  nodesExplored: number;
  success: boolean;
}

export interface AlgorithmInfo {
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimal: boolean;
  complete: boolean;
}

export type Algorithm = 'astar' | 'dijkstra' | 'bfs' | 'dfs' | 'bidirectional';
export type GenerationAlgorithm = 'recursive' | 'prim' | 'kruskal' | 'empty';
export type EditMode = 'wall' | 'start' | 'end' | 'none';