class MazeRunner {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Maze configuration
    this.cellSize = 4;
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);
    this.maze = [];
    this.visited = [];

    // Runner (solver) configuration
    this.runnerX = 1;
    this.runnerY = 1;
    this.targetX = this.cols - 2;
    this.targetY = this.rows - 2;
    this.path = [];
    this.currentPath = [];
    this.pathIndex = 0;
    this.solving = false;
    this.solutionFound = false;

    // Animation timing
    this.mazeGenerationStep = 0;
    this.generationComplete = false;
    this.runnerSpeed = 8; // frames between moves

    // Colors
    this.wallColor = '#FFFFFF';
    this.pathColor = '#000000';
    this.runnerColor = '#FF0000';
    this.targetColor = '#00FF00';
    this.visitedColor = '#0080FF';
    this.solutionColor = '#FFFF00';

    this.lastTime = 0;
    this.frameRate = 13; // ~75fps (1000ms / 75fps ≈ 13ms)
    this.frameCount = 0;
  }

  init() {
    this.canvas = document.getElementById('maze-canvas');
    if (!this.canvas) {
      console.error('Maze canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    this.generateMaze();
    this.animate();
    console.log('Maze Runner initialized');
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

    // Control frame rate
    if (currentTime - this.lastTime < this.frameRate) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastTime = currentTime;
    this.frameCount++;
    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  generateMaze() {
    // Initialize maze with all walls
    this.maze = [];
    this.visited = [];
    for (let y = 0; y < this.rows; y++) {
      this.maze[y] = [];
      this.visited[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.maze[y][x] = 1; // 1 = wall, 0 = path
        this.visited[y][x] = false;
      }
    }

    // Create simple maze pattern
    for (let y = 1; y < this.rows - 1; y += 2) {
      for (let x = 1; x < this.cols - 1; x += 2) {
        this.maze[y][x] = 0; // Create path

        // Create connections
        if (x < this.cols - 2 && Math.random() > 0.3) {
          this.maze[y][x + 1] = 0;
        }
        if (y < this.rows - 2 && Math.random() > 0.3) {
          this.maze[y + 1][x] = 0;
        }
      }
    }

    // Ensure start and end are clear
    this.maze[1][1] = 0;
    this.maze[this.rows - 2][this.cols - 2] = 0;

    this.generationComplete = true;
    this.solving = true;
  }

  update() {
    if (!this.generationComplete) return;

    if (this.solving && !this.solutionFound) {
      if (this.frameCount % this.runnerSpeed === 0) {
        this.solveMaze();
      }
    } else if (this.solutionFound) {
      // Animate along the solution path
      if (this.frameCount % this.runnerSpeed === 0) {
        this.pathIndex++;
        if (this.pathIndex >= this.currentPath.length) {
          // Reset and generate new maze
          this.resetMaze();
        }
      }
    }
  }

  solveMaze() {
    // Simple A* pathfinding simulation
    if (this.currentPath.length === 0) {
      this.currentPath = this.findPath(this.runnerX, this.runnerY, this.targetX, this.targetY);
      this.pathIndex = 0;
    }

    if (this.currentPath.length > 0 && this.pathIndex < this.currentPath.length) {
      const nextStep = this.currentPath[this.pathIndex];
      this.runnerX = nextStep.x;
      this.runnerY = nextStep.y;
      this.pathIndex++;

      if (this.runnerX === this.targetX && this.runnerY === this.targetY) {
        this.solutionFound = true;
        this.pathIndex = 0;
      }
    }
  }

  findPath(startX, startY, endX, endY) {
    const path = [];
    const queue = [{x: startX, y: startY, path: [{x: startX, y: startY}]}];
    const visited = new Set();

    const directions = [
      {x: 0, y: -1}, // Up
      {x: 1, y: 0},  // Right
      {x: 0, y: 1},  // Down
      {x: -1, y: 0}  // Left
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (current.x === endX && current.y === endY) {
        return current.path;
      }

      for (const dir of directions) {
        const newX = current.x + dir.x;
        const newY = current.y + dir.y;

        if (newX >= 0 && newX < this.cols && newY >= 0 && newY < this.rows &&
            this.maze[newY][newX] === 0 && !visited.has(`${newX},${newY}`)) {

          const newPath = [...current.path, {x: newX, y: newY}];
          queue.push({x: newX, y: newY, path: newPath});
        }
      }
    }

    return path;
  }

  resetMaze() {
    setTimeout(() => {
      this.runnerX = 1;
      this.runnerY = 1;
      this.currentPath = [];
      this.pathIndex = 0;
      this.solving = false;
      this.solutionFound = false;
      this.generationComplete = false;

      this.generateMaze();
    }, 2000); // Wait 2 seconds before generating new maze
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw maze
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;

        if (this.maze[y][x] === 1) {
          // Draw wall
          this.ctx.fillStyle = this.wallColor;
          this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
        }
      }
    }

    // Draw solution path if found
    if (this.solutionFound && this.currentPath.length > 0) {
      this.ctx.fillStyle = this.solutionColor;
      for (let i = 0; i < Math.min(this.pathIndex, this.currentPath.length); i++) {
        const step = this.currentPath[i];
        this.ctx.fillRect(
          step.x * this.cellSize,
          step.y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      }
    }

    // Draw target
    this.ctx.fillStyle = this.targetColor;
    this.ctx.fillRect(
      this.targetX * this.cellSize,
      this.targetY * this.cellSize,
      this.cellSize,
      this.cellSize
    );

    // Draw runner
    this.ctx.fillStyle = this.runnerColor;
    this.ctx.fillRect(
      this.runnerX * this.cellSize,
      this.runnerY * this.cellSize,
      this.cellSize,
      this.cellSize
    );

    // Draw visited path during solving
    if (this.solving && !this.solutionFound && this.currentPath.length > 0) {
      this.ctx.fillStyle = this.visitedColor;
      for (let i = 0; i < Math.min(this.pathIndex, this.currentPath.length); i++) {
        const step = this.currentPath[i];
        this.ctx.fillRect(
          step.x * this.cellSize + 1,
          step.y * this.cellSize + 1,
          this.cellSize - 2,
          this.cellSize - 2
        );
      }
    }
  }

  pause() {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.animate();
    }
  }

  destroy() {
    this.pause();
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

// Initialize global maze runner
window.mazeRunner = new MazeRunner();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.mazeRunner) {
    window.mazeRunner.destroy();
  }
});