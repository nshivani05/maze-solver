import { Cell } from '../types/maze';

export class MazeGenerator {
  static createEmptyMaze(width: number, height: number): Cell[][] {
    const maze: Cell[][] = [];
    
    for (let y = 0; y < height; y++) {
      maze[y] = [];
      for (let x = 0; x < width; x++) {
        maze[y][x] = {
          x,
          y,
          isWall: false,
          isStart: false,
          isEnd: false,
          isPath: false,
          isVisited: false,
          isExploring: false,
          gCost: 0,
          hCost: 0,
          fCost: 0,
          parent: null,
          distance: Infinity
        };
      }
    }
    
    return maze;
  }

  static recursiveBacktracking(width: number, height: number): Cell[][] {
    // Ensure odd dimensions for perfect maze generation
    const adjustedWidth = width % 2 === 0 ? width - 1 : width;
    const adjustedHeight = height % 2 === 0 ? height - 1 : height;
    
    const maze = this.createEmptyMaze(adjustedWidth, adjustedHeight);
    
    // Fill with walls initially
    for (let y = 0; y < adjustedHeight; y++) {
      for (let x = 0; x < adjustedWidth; x++) {
        maze[y][x].isWall = true;
      }
    }

    const stack: Cell[] = [];
    const startX = 1;
    const startY = 1;
    
    maze[startY][startX].isWall = false;
    stack.push(maze[startY][startX]);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, maze, 2);
      
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Remove wall between current and next
        const wallX = current.x + (next.x - current.x) / 2;
        const wallY = current.y + (next.y - current.y) / 2;
        
        if (wallX >= 0 && wallX < adjustedWidth && wallY >= 0 && wallY < adjustedHeight) {
          maze[wallY][wallX].isWall = false;
        }
        next.isWall = false;
        
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    return maze;
  }

  static prim(width: number, height: number): Cell[][] {
    const maze = this.createEmptyMaze(width, height);
    
    // Fill with walls initially
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        maze[y][x].isWall = true;
      }
    }

    const walls: Cell[] = [];
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height / 2);
    
    maze[startY][startX].isWall = false;
    this.addWallsToList(maze[startY][startX], maze, walls);

    while (walls.length > 0) {
      const randomIndex = Math.floor(Math.random() * walls.length);
      const wall = walls[randomIndex];
      walls.splice(randomIndex, 1);

      const neighbors = this.getPassageNeighbors(wall, maze);
      
      if (neighbors.length === 1) {
        wall.isWall = false;
        this.addWallsToList(wall, maze, walls);
      }
    }

    return maze;
  }

  static kruskal(width: number, height: number): Cell[][] {
    const maze = this.createEmptyMaze(width, height);
    
    // Fill with walls initially
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        maze[y][x].isWall = true;
      }
    }

    // Union-Find data structure
    const parent: number[] = [];
    const rank: number[] = [];
    
    const find = (x: number): number => {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]);
      }
      return parent[x];
    };
    
    const union = (x: number, y: number): boolean => {
      const rootX = find(x);
      const rootY = find(y);
      
      if (rootX === rootY) return false;
      
      if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
      } else if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
      } else {
        parent[rootY] = rootX;
        rank[rootX]++;
      }
      
      return true;
    };

    // Initialize cells and union-find
    const cells: Cell[] = [];
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        maze[y][x].isWall = false;
        cells.push(maze[y][x]);
        const index = cells.length - 1;
        parent[index] = index;
        rank[index] = 0;
      }
    }

    // Create edges between adjacent cells
    const edges: Array<[number, number, Cell]> = [];
    cells.forEach((cell, index) => {
      const x = cell.x;
      const y = cell.y;
      
      // Right neighbor
      if (x + 2 < width - 1) {
        const neighborIndex = cells.findIndex(c => c.x === x + 2 && c.y === y);
        if (neighborIndex !== -1) {
          edges.push([index, neighborIndex, maze[y][x + 1]]);
        }
      }
      
      // Bottom neighbor
      if (y + 2 < height - 1) {
        const neighborIndex = cells.findIndex(c => c.x === x && c.y === y + 2);
        if (neighborIndex !== -1) {
          edges.push([index, neighborIndex, maze[y + 1][x]]);
        }
      }
    });

    // Shuffle edges
    for (let i = edges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [edges[i], edges[j]] = [edges[j], edges[i]];
    }

    // Process edges
    edges.forEach(([a, b, wall]) => {
      if (union(a, b)) {
        wall.isWall = false;
      }
    });

    return maze;
  }

  private static getUnvisitedNeighbors(cell: Cell, maze: Cell[][], distance: number): Cell[] {
    const neighbors: Cell[] = [];
    const directions = [[0, distance], [distance, 0], [0, -distance], [-distance, 0]];

    directions.forEach(([dx, dy]) => {
      const newX = cell.x + dx;
      const newY = cell.y + dy;
      
      if (newX > 0 && newX < maze[0].length - 1 && 
          newY > 0 && newY < maze.length - 1 && 
          maze[newY][newX].isWall) {
        neighbors.push(maze[newY][newX]);
      }
    });

    return neighbors;
  }

  private static addWallsToList(cell: Cell, maze: Cell[][], walls: Cell[]): void {
    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];

    directions.forEach(([dx, dy]) => {
      const wallX = cell.x + dx / 2;
      const wallY = cell.y + dy / 2;
      const nextX = cell.x + dx;
      const nextY = cell.y + dy;
      
      if (nextX > 0 && nextX < maze[0].length - 1 && 
          nextY > 0 && nextY < maze.length - 1 && 
          wallX >= 0 && wallX < maze[0].length &&
          wallY >= 0 && wallY < maze.length &&
          maze[wallY][wallX].isWall &&
          !walls.includes(maze[wallY][wallX])) {
        walls.push(maze[wallY][wallX]);
      }
    });
  }

  private static getPassageNeighbors(cell: Cell, maze: Cell[][]): Cell[] {
    const neighbors: Cell[] = [];
    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];

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

  static addRandomWalls(maze: Cell[][], density: number = 0.3): void {
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const cell = maze[y][x];
        if (!cell.isStart && !cell.isEnd && Math.random() < density) {
          cell.isWall = true;
        }
      }
    }
  }

  static ensureStartEndAccessible(maze: Cell[][], startX: number, startY: number, endX: number, endY: number): void {
    // Ensure start and end positions are not walls
    if (startY >= 0 && startY < maze.length && startX >= 0 && startX < maze[0].length) {
      maze[startY][startX].isWall = false;
    }
    if (endY >= 0 && endY < maze.length && endX >= 0 && endX < maze[0].length) {
      maze[endY][endX].isWall = false;
    }

    // Clear a small area around start and end to ensure accessibility
    const clearArea = (centerX: number, centerY: number) => {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const newX = centerX + dx;
          const newY = centerY + dy;
          if (newY >= 0 && newY < maze.length && newX >= 0 && newX < maze[0].length) {
            maze[newY][newX].isWall = false;
          }
        }
      }
    };

    clearArea(startX, startY);
    clearArea(endX, endY);
  }
}