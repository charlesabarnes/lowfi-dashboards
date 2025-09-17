class PacmanMaze {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // 75 fps targeting
    this.targetFPS = 75;
    this.frameTime = 1000 / this.targetFPS;
    this.lastTime = 0;

    // Animation time
    this.time = 0;

    // Grid settings for maze
    this.tileSize = 4;
    this.cols = Math.floor(this.width / this.tileSize);
    this.rows = Math.floor(this.height / this.tileSize);

    // Maze layout (1 = wall, 0 = empty, 2 = dot, 3 = power pellet)
    this.maze = this.generateMaze();

    // Pac-Man
    this.pacman = {
      x: 8, y: 8,
      direction: 0, // 0=right, 1=down, 2=left, 3=up
      nextDirection: 0,
      animFrame: 0,
      speed: 0.1
    };

    // Ghosts
    this.ghosts = [
      { x: 16, y: 8, direction: 0, color: '#FF0000', speed: 0.08 }, // Red
      { x: 14, y: 8, direction: 1, color: '#FFB8FF', speed: 0.08 }, // Pink
      { x: 16, y: 10, direction: 2, color: '#00FFFF', speed: 0.08 }, // Cyan
      { x: 14, y: 10, direction: 3, color: '#FFB852', speed: 0.08 }  // Orange
    ];

    // Game state
    this.score = 0;
    this.dotsRemaining = 0;
    this.countDotsRemaining();
  }

  init() {
    this.canvas = document.getElementById('pacman-canvas');
    if (!this.canvas) {
      console.error('Pac-Man canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Pac-Man Maze initialized with 75fps targeting');
  }

  generateMaze() {
    // Simple maze pattern optimized for 128x64 (32x16 tiles at 4px each)
    const maze = [];

    // Initialize with walls
    for (let row = 0; row < this.rows; row++) {
      maze[row] = [];
      for (let col = 0; col < this.cols; col++) {
        maze[row][col] = 1;
      }
    }

    // Create corridors and add dots
    for (let row = 1; row < this.rows - 1; row += 2) {
      for (let col = 1; col < this.cols - 1; col += 2) {
        maze[row][col] = 2; // dot

        // Create horizontal corridors
        if (col < this.cols - 3 && Math.random() > 0.3) {
          maze[row][col + 1] = 2;
          maze[row][col + 2] = 2;
        }

        // Create vertical corridors
        if (row < this.rows - 3 && Math.random() > 0.3) {
          maze[row + 1][col] = 2;
          maze[row + 2][col] = 2;
        }
      }
    }

    // Add power pellets in corners
    maze[2][2] = 3;
    maze[2][this.cols - 3] = 3;
    maze[this.rows - 3][2] = 3;
    maze[this.rows - 3][this.cols - 3] = 3;

    // Ensure center area is clear for ghosts
    for (let row = 6; row < 10; row++) {
      for (let col = 12; col < 20; col++) {
        if (row < this.rows && col < this.cols) {
          maze[row][col] = 0; // empty space
        }
      }
    }

    return maze;
  }

  countDotsRemaining() {
    this.dotsRemaining = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.maze[row][col] === 2 || this.maze[row][col] === 3) {
          this.dotsRemaining++;
        }
      }
    }
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

    // Control frame rate to 75fps
    if (currentTime - this.lastTime < this.frameTime) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastTime = currentTime;
    this.time += 0.016;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    // Update Pac-Man
    this.updatePacman();

    // Update ghosts
    this.ghosts.forEach(ghost => this.updateGhost(ghost));

    // Check collisions
    this.checkCollisions();

    // Respawn dots if all eaten
    if (this.dotsRemaining <= 0) {
      this.maze = this.generateMaze();
      this.countDotsRemaining();
      this.score = 0;
    }
  }

  updatePacman() {
    // Simple AI for Pac-Man movement
    if (Math.floor(this.time * 10) % 30 === 0) {
      const directions = [0, 1, 2, 3];
      this.pacman.nextDirection = directions[Math.floor(Math.random() * directions.length)];
    }

    // Try to change direction
    const nextX = this.pacman.x + (this.pacman.nextDirection === 0 ? this.pacman.speed :
                                   this.pacman.nextDirection === 2 ? -this.pacman.speed : 0);
    const nextY = this.pacman.y + (this.pacman.nextDirection === 1 ? this.pacman.speed :
                                   this.pacman.nextDirection === 3 ? -this.pacman.speed : 0);

    if (this.canMove(nextX, nextY)) {
      this.pacman.direction = this.pacman.nextDirection;
    }

    // Move Pac-Man
    const moveX = this.pacman.direction === 0 ? this.pacman.speed :
                  this.pacman.direction === 2 ? -this.pacman.speed : 0;
    const moveY = this.pacman.direction === 1 ? this.pacman.speed :
                  this.pacman.direction === 3 ? -this.pacman.speed : 0;

    const newX = this.pacman.x + moveX;
    const newY = this.pacman.y + moveY;

    if (this.canMove(newX, newY)) {
      this.pacman.x = newX;
      this.pacman.y = newY;
    }

    // Wrap around screen edges
    if (this.pacman.x < 0) this.pacman.x = this.cols - 1;
    if (this.pacman.x >= this.cols) this.pacman.x = 0;
    if (this.pacman.y < 0) this.pacman.y = this.rows - 1;
    if (this.pacman.y >= this.rows) this.pacman.y = 0;

    // Update animation frame
    this.pacman.animFrame = Math.floor(this.time * 8) % 4;

    // Eat dots
    const tileX = Math.floor(this.pacman.x);
    const tileY = Math.floor(this.pacman.y);
    if (this.maze[tileY] && (this.maze[tileY][tileX] === 2 || this.maze[tileY][tileX] === 3)) {
      this.maze[tileY][tileX] = 0;
      this.score += this.maze[tileY][tileX] === 3 ? 50 : 10;
      this.dotsRemaining--;
    }
  }

  updateGhost(ghost) {
    // Simple AI for ghost movement
    if (Math.floor(this.time * 15 + ghost.x + ghost.y) % 45 === 0) {
      const directions = [0, 1, 2, 3];
      ghost.direction = directions[Math.floor(Math.random() * directions.length)];
    }

    // Move ghost
    const moveX = ghost.direction === 0 ? ghost.speed :
                  ghost.direction === 2 ? -ghost.speed : 0;
    const moveY = ghost.direction === 1 ? ghost.speed :
                  ghost.direction === 3 ? -ghost.speed : 0;

    const newX = ghost.x + moveX;
    const newY = ghost.y + moveY;

    if (this.canMove(newX, newY)) {
      ghost.x = newX;
      ghost.y = newY;
    } else {
      // Change direction when hitting wall
      ghost.direction = (ghost.direction + 1) % 4;
    }

    // Wrap around screen edges
    if (ghost.x < 0) ghost.x = this.cols - 1;
    if (ghost.x >= this.cols) ghost.x = 0;
    if (ghost.y < 0) ghost.y = this.rows - 1;
    if (ghost.y >= this.rows) ghost.y = 0;
  }

  canMove(x, y) {
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    return tileY >= 0 && tileY < this.rows &&
           tileX >= 0 && tileX < this.cols &&
           (!this.maze[tileY] || this.maze[tileY][tileX] !== 1);
  }

  checkCollisions() {
    // Check Pac-Man vs ghosts (simple distance check)
    this.ghosts.forEach(ghost => {
      const dx = this.pacman.x - ghost.x;
      const dy = this.pacman.y - ghost.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.8) {
        // Reset Pac-Man position
        this.pacman.x = 8;
        this.pacman.y = 8;
      }
    });
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw maze
    this.drawMaze();

    // Draw Pac-Man
    this.drawPacman();

    // Draw ghosts
    this.ghosts.forEach(ghost => this.drawGhost(ghost));
  }

  drawMaze() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.tileSize;
        const y = row * this.tileSize;

        switch (this.maze[row][col]) {
          case 1: // Wall
            this.ctx.fillStyle = '#0000FF';
            this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
            break;
          case 2: // Dot
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.fillRect(x + this.tileSize/2 - 1, y + this.tileSize/2 - 1, 2, 2);
            break;
          case 3: // Power pellet
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
            break;
        }
      }
    }
  }

  drawPacman() {
    const x = Math.floor(this.pacman.x * this.tileSize);
    const y = Math.floor(this.pacman.y * this.tileSize);

    this.ctx.fillStyle = '#FFFF00';

    // Draw Pac-Man based on direction and animation frame
    if (this.pacman.animFrame < 2) {
      // Closed mouth
      this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
    } else {
      // Open mouth - draw as rectangle with missing triangle
      this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

      // Remove mouth opening
      this.ctx.fillStyle = '#000000';
      const mouthSize = this.tileSize / 2;

      switch (this.pacman.direction) {
        case 0: // Right
          this.ctx.fillRect(x + mouthSize, y + 1, mouthSize, this.tileSize - 2);
          break;
        case 1: // Down
          this.ctx.fillRect(x + 1, y + mouthSize, this.tileSize - 2, mouthSize);
          break;
        case 2: // Left
          this.ctx.fillRect(x, y + 1, mouthSize, this.tileSize - 2);
          break;
        case 3: // Up
          this.ctx.fillRect(x + 1, y, this.tileSize - 2, mouthSize);
          break;
      }
    }
  }

  drawGhost(ghost) {
    const x = Math.floor(ghost.x * this.tileSize);
    const y = Math.floor(ghost.y * this.tileSize);

    this.ctx.fillStyle = ghost.color;

    // Ghost body
    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Ghost eyes
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(x + 1, y + 1, 1, 1);
    this.ctx.fillRect(x + this.tileSize - 2, y + 1, 1, 1);
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

// Initialize global Pac-Man maze
window.pacmanMaze = new PacmanMaze();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.pacmanMaze) {
    window.pacmanMaze.destroy();
  }
});