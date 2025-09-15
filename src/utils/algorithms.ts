import { Cell, AlgorithmResult } from '../types/maze';

export class PathfindingAlgorithms {
  static getNeighbors(cell: Cell, maze: Cell[][]): Cell[] {
    const neighbors: Cell[] = [];
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];

    directions.forEach(([dx, dy]) => {
      const newX = cell.x + dx;
      const newY = cell.y + dy;
      
      if (newX >= 0 && newX < maze[0].length && 
          newY >= 0 && newY < maze.length && 
          !maze[newY][newX].isWall) {
        neighbors.push(maze[newY][newX]);
      }
    });

    return neighbors;
  }

  static heuristic(a: Cell, b: Cell): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
  }

  static reconstructPath(endCell: Cell): Cell[] {
    const path: Cell[] = [];
    let current = endCell;
    
    while (current) {
      path.unshift(current);
      current = current.parent!;
    }
    
    return path;
  }

  static resetMaze(maze: Cell[][]): void {
    maze.forEach(row => {
      row.forEach(cell => {
        cell.isPath = false;
        cell.isVisited = false;
        cell.isExploring = false;
        cell.gCost = 0;
        cell.hCost = 0;
        cell.fCost = 0;
        cell.parent = null;
        cell.distance = Infinity;
      });
    });
  }

  static async aStar(
    maze: Cell[][], 
    start: Cell, 
    end: Cell,
    onProgress?: (cell: Cell) => void,
    delay: number = 10
  ): Promise<AlgorithmResult> {
    const startTime = performance.now();
    const openSet: Cell[] = [start];
    const closedSet = new Set<Cell>();
    let nodesExplored = 0;

    start.gCost = 0;
    start.hCost = this.heuristic(start, end);
    start.fCost = start.gCost + start.hCost;

    while (openSet.length > 0) {
      // Sort by fCost, then by hCost for tie-breaking
      openSet.sort((a, b) => {
        if (a.fCost === b.fCost) return a.hCost - b.hCost;
        return a.fCost - b.fCost;
      });
      
      const current = openSet.shift()!;
      
      if (current === end) {
        const path = this.reconstructPath(end);
        return {
          path,
          visitedNodes: Array.from(closedSet),
          executionTime: performance.now() - startTime,
          pathLength: path.length - 1,
          nodesExplored,
          success: true
        };
      }

      closedSet.add(current);
      current.isExploring = true;
      nodesExplored++;
      
      if (onProgress && delay > 0) {
        onProgress(current);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const neighbors = this.getNeighbors(current, maze);
      
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor)) continue;

        const tentativeGCost = current.gCost + 1;
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        } else if (tentativeGCost >= neighbor.gCost) {
          continue;
        }

        neighbor.parent = current;
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = this.heuristic(neighbor, end);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;
      }
    }

    return {
      path: [],
      visitedNodes: Array.from(closedSet),
      executionTime: performance.now() - startTime,
      pathLength: 0,
      nodesExplored,
      success: false
    };
  }

  static async dijkstra(
    maze: Cell[][], 
    start: Cell, 
    end: Cell,
    onProgress?: (cell: Cell) => void,
    delay: number = 10
  ): Promise<AlgorithmResult> {
    const startTime = performance.now();
    const unvisited = new Set<Cell>();
    const visited = new Set<Cell>();
    let nodesExplored = 0;

    // Initialize all cells
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x];
        cell.distance = cell === start ? 0 : Infinity;
        cell.parent = null;
        if (!cell.isWall) {
          unvisited.add(cell);
        }
      }
    }

    while (unvisited.size > 0) {
      const current = Array.from(unvisited).reduce((min, cell) => 
        cell.distance < min.distance ? cell : min
      );

      if (current.distance === Infinity) break;
      
      unvisited.delete(current);
      visited.add(current);
      
      if (current === end) {
        const path = this.reconstructPath(end);
        return {
          path,
          visitedNodes: Array.from(visited),
          executionTime: performance.now() - startTime,
          pathLength: path.length - 1,
          nodesExplored,
          success: true
        };
      }

      current.isExploring = true;
      nodesExplored++;

      if (onProgress && delay > 0) {
        onProgress(current);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const neighbors = this.getNeighbors(current, maze);
      
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor)) continue;
        
        const alt = current.distance + 1;
        if (alt < neighbor.distance) {
          neighbor.distance = alt;
          neighbor.parent = current;
        }
      }
    }

    return {
      path: [],
      visitedNodes: Array.from(visited),
      executionTime: performance.now() - startTime,
      pathLength: 0,
      nodesExplored,
      success: false
    };
  }

  static async bfs(
    maze: Cell[][], 
    start: Cell, 
    end: Cell,
    onProgress?: (cell: Cell) => void,
    delay: number = 10
  ): Promise<AlgorithmResult> {
    const startTime = performance.now();
    const queue: Cell[] = [start];
    const visited = new Set<Cell>([start]);
    let nodesExplored = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current === end) {
        const path = this.reconstructPath(end);
        return {
          path,
          visitedNodes: Array.from(visited),
          executionTime: performance.now() - startTime,
          pathLength: path.length - 1,
          nodesExplored,
          success: true
        };
      }

      current.isExploring = true;
      nodesExplored++;

      if (onProgress && delay > 0) {
        onProgress(current);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const neighbors = this.getNeighbors(current, maze);
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          neighbor.parent = current;
          queue.push(neighbor);
        }
      }
    }

    return {
      path: [],
      visitedNodes: Array.from(visited),
      executionTime: performance.now() - startTime,
      pathLength: 0,
      nodesExplored,
      success: false
    };
  }

  static async dfs(
    maze: Cell[][], 
    start: Cell, 
    end: Cell,
    onProgress?: (cell: Cell) => void,
    delay: number = 10
  ): Promise<AlgorithmResult> {
    const startTime = performance.now();
    const stack: Cell[] = [start];
    const visited = new Set<Cell>();
    let nodesExplored = 0;

    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (visited.has(current)) continue;
      
      visited.add(current);
      
      if (current === end) {
        const path = this.reconstructPath(end);
        return {
          path,
          visitedNodes: Array.from(visited),
          executionTime: performance.now() - startTime,
          pathLength: path.length - 1,
          nodesExplored,
          success: true
        };
      }

      current.isExploring = true;
      nodesExplored++;

      if (onProgress && delay > 0) {
        onProgress(current);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const neighbors = this.getNeighbors(current, maze);
      // Shuffle neighbors for more interesting DFS behavior
      const shuffledNeighbors = neighbors.sort(() => Math.random() - 0.5);
      
      for (const neighbor of shuffledNeighbors) {
        if (!visited.has(neighbor)) {
          neighbor.parent = current;
          stack.push(neighbor);
        }
      }
    }

    return {
      path: [],
      visitedNodes: Array.from(visited),
      executionTime: performance.now() - startTime,
      pathLength: 0,
      nodesExplored,
      success: false
    };
  }

  static async bidirectional(
    maze: Cell[][], 
    start: Cell, 
    end: Cell,
    onProgress?: (cell: Cell) => void,
    delay: number = 10
  ): Promise<AlgorithmResult> {
    const startTime = performance.now();
    const forwardQueue: Cell[] = [start];
    const backwardQueue: Cell[] = [end];
    const forwardVisited = new Set<Cell>([start]);
    const backwardVisited = new Set<Cell>([end]);
    let nodesExplored = 0;
    let meetingPoint: Cell | null = null;

    // Mark start and end for identification
    start.distance = 0;
    end.distance = 0;

    while (forwardQueue.length > 0 || backwardQueue.length > 0) {
      // Forward search
      if (forwardQueue.length > 0) {
        const current = forwardQueue.shift()!;
        
        if (backwardVisited.has(current)) {
          meetingPoint = current;
          break;
        }

        current.isExploring = true;
        nodesExplored++;

        if (onProgress && delay > 0) {
          onProgress(current);
          await new Promise(resolve => setTimeout(resolve, delay / 2));
        }

        const neighbors = this.getNeighbors(current, maze);
        for (const neighbor of neighbors) {
          if (!forwardVisited.has(neighbor)) {
            forwardVisited.add(neighbor);
            neighbor.parent = current;
            neighbor.distance = current.distance + 1;
            forwardQueue.push(neighbor);
          }
        }
      }

      // Backward search
      if (backwardQueue.length > 0) {
        const current = backwardQueue.shift()!;
        
        if (forwardVisited.has(current)) {
          meetingPoint = current;
          break;
        }

        current.isExploring = true;
        nodesExplored++;

        if (onProgress && delay > 0) {
          onProgress(current);
          await new Promise(resolve => setTimeout(resolve, delay / 2));
        }

        const neighbors = this.getNeighbors(current, maze);
        for (const neighbor of neighbors) {
          if (!backwardVisited.has(neighbor)) {
            backwardVisited.add(neighbor);
            // For backward search, we need to track the path differently
            if (!neighbor.parent) {
              neighbor.parent = current;
            }
            backwardQueue.push(neighbor);
          }
        }
      }
    }

    if (meetingPoint) {
      // Reconstruct path from both directions
      const forwardPath = this.reconstructPath(meetingPoint);
      const backwardPath: Cell[] = [];
      
      let current = meetingPoint;
      while (current && current !== end) {
        const neighbors = this.getNeighbors(current, maze);
        let found = false;
        
        for (const neighbor of neighbors) {
          if (backwardVisited.has(neighbor) && neighbor.parent === current) {
            current = neighbor;
            backwardPath.push(current);
            found = true;
            break;
          }
        }
        
        if (!found) break;
      }

      const fullPath = [...forwardPath, ...backwardPath.reverse()];
      
      return {
        path: fullPath,
        visitedNodes: [...Array.from(forwardVisited), ...Array.from(backwardVisited)],
        executionTime: performance.now() - startTime,
        pathLength: fullPath.length - 1,
        nodesExplored,
        success: true
      };
    }

    return {
      path: [],
      visitedNodes: [...Array.from(forwardVisited), ...Array.from(backwardVisited)],
      executionTime: performance.now() - startTime,
      pathLength: 0,
      nodesExplored,
      success: false
    };
  }
}