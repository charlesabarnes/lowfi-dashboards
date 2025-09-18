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
    this.frameCount = 0;

    // Maze layout (1 = wall, 0 = empty, 2 = dot, 3 = power pellet)
    this.maze = this.createClassicMaze();

    // Pac-Man (pixel coordinates)
    this.pacman = {
      x: 64,
      y: 48,
      direction: 0, // 0=right, 1=down, 2=left, 3=up
      nextDirection: 0,
      animFrame: 0,
      speed: 0.5,
      mouthAngle: 0,
      targetDot: null
    };

    // Ghosts with classic behavior
    this.ghosts = [
      { x: 64, y: 24, targetX: 0, targetY: 0, direction: 0,
        color: '#FF0000', name: 'blinky', speed: 0.4, mode: 'scatter' }, // Red - follows Pacman
      { x: 56, y: 32, targetX: 0, targetY: 0, direction: 1,
        color: '#FFB8FF', name: 'pinky', speed: 0.4, mode: 'scatter' }, // Pink - ambushes
      { x: 72, y: 32, targetX: 0, targetY: 0, direction: 2,
        color: '#00FFFF', name: 'inky', speed: 0.4, mode: 'scatter' }, // Cyan - unpredictable
      { x: 64, y: 32, targetX: 0, targetY: 0, direction: 3,
        color: '#FFB852', name: 'clyde', speed: 0.4, mode: 'scatter' }  // Orange - random
    ];

    // Game state
    this.score = Math.floor(Math.random() * 5000);
    this.dotsRemaining = 0;
    this.powerMode = false;
    this.powerModeTimer = 0;
    this.waveNumber = 1;

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

  createClassicMaze() {
    // Classic Pac-Man style maze adapted for 128x64
    // Using string representation for easier editing
    const mazeString = [
      "################################",
      "#..............................#",
      "#.####.#####.##.#####.####.#",
      "#o#  #.#   #.##.#   #.#  #o#",
      "#.####.#####.##.#####.####.#",
      "#..........................#",
      "#.####.##.########.##.####.#",
      "#......##....##....##......#",
      "######.##### ## #####.######",
      "     #.##          ##.#     ",
      "     #.## ###--### ##.#     ",
      "######.## #      # ##.######",
      "      .   #      #   .      ",
      "######.## #      # ##.######",
      "     #.## ######## ##.#     ",
      "     #.##    ##    ##.#     ",
      "######.##.########.##.######",
      "#............##............#",
      "#.####.#####.##.#####.####.#",
      "#o..##................##..o#",
      "###.##.##.########.##.##.###",
      "#......##....##....##......#",
      "#.##########.##.##########.#",
      "#..........................#",
      "################################"
    ];

    // Convert to numeric maze (scale down to fit 128x64)
    const maze = [];
    const scaleY = mazeString.length / 16; // Target 16 rows
    const scaleX = mazeString[0].length / 32; // Target 32 columns

    for (let y = 0; y < 16; y++) {
      maze[y] = [];
      for (let x = 0; x < 32; x++) {
        const sourceY = Math.floor(y * scaleY);
        const sourceX = Math.floor(x * scaleX);
        const char = mazeString[sourceY][sourceX];

        switch(char) {
          case '#': maze[y][x] = 1; break; // wall
          case '.': maze[y][x] = 2; break; // dot
          case 'o': maze[y][x] = 3; break; // power pellet
          case '-': maze[y][x] = 0; break; // ghost house door
          default: maze[y][x] = 0; break; // empty
        }
      }
    }

    return maze;
  }

  countDotsRemaining() {
    this.dotsRemaining = 0;
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 32; col++) {
        if (this.maze[row] && (this.maze[row][col] === 2 || this.maze[row][col] === 3)) {
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
    this.frameCount++;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    // Update power mode timer
    if (this.powerMode) {
      this.powerModeTimer--;
      if (this.powerModeTimer <= 0) {
        this.powerMode = false;
        this.ghosts.forEach(ghost => ghost.mode = 'chase');
      }
    }

    // Update Pac-Man
    this.updatePacman();

    // Update ghosts
    this.ghosts.forEach(ghost => this.updateGhost(ghost));

    // Check collisions
    this.checkCollisions();

    // Respawn dots if all eaten
    if (this.dotsRemaining <= 0) {
      this.waveNumber++;
      this.maze = this.createClassicMaze();
      this.countDotsRemaining();
      this.score += 1000;

      // Reset positions
      this.pacman.x = 64;
      this.pacman.y = 48;
      this.ghosts[0].x = 64; this.ghosts[0].y = 24;
      this.ghosts[1].x = 56; this.ghosts[1].y = 32;
      this.ghosts[2].x = 72; this.ghosts[2].y = 32;
      this.ghosts[3].x = 64; this.ghosts[3].y = 32;
    }
  }

  updatePacman() {
    // Smart AI for Pac-Man - find nearest dot
    if (this.frameCount % 15 === 0 || !this.pacman.targetDot) {
      this.findNearestDot();
    }

    // Calculate desired direction toward target
    if (this.pacman.targetDot) {
      const dx = this.pacman.targetDot.x * 4 - this.pacman.x;
      const dy = this.pacman.targetDot.y * 4 - this.pacman.y;

      // Choose direction based on distance
      if (Math.abs(dx) > Math.abs(dy)) {
        this.pacman.nextDirection = dx > 0 ? 0 : 2; // right or left
      } else {
        this.pacman.nextDirection = dy > 0 ? 1 : 3; // down or up
      }
    }

    // Try to change direction at intersections
    const tileX = Math.floor(this.pacman.x / 4);
    const tileY = Math.floor(this.pacman.y / 4);
    const pixelX = this.pacman.x % 4;
    const pixelY = this.pacman.y % 4;

    if (pixelX < 1 && pixelY < 1) { // At grid intersection
      const nextDirX = this.pacman.nextDirection === 0 ? 1 : this.pacman.nextDirection === 2 ? -1 : 0;
      const nextDirY = this.pacman.nextDirection === 1 ? 1 : this.pacman.nextDirection === 3 ? -1 : 0;

      if (this.canMoveTile(tileX + nextDirX, tileY + nextDirY)) {
        this.pacman.direction = this.pacman.nextDirection;
      }
    }

    // Move Pac-Man
    const moveX = this.pacman.direction === 0 ? this.pacman.speed :
                  this.pacman.direction === 2 ? -this.pacman.speed : 0;
    const moveY = this.pacman.direction === 1 ? this.pacman.speed :
                  this.pacman.direction === 3 ? -this.pacman.speed : 0;

    const newX = this.pacman.x + moveX;
    const newY = this.pacman.y + moveY;
    const newTileX = Math.floor(newX / 4);
    const newTileY = Math.floor(newY / 4);

    if (this.canMoveTile(newTileX, newTileY)) {
      this.pacman.x = newX;
      this.pacman.y = newY;
    }

    // Wrap around screen edges
    if (this.pacman.x < 0) this.pacman.x = this.width - 1;
    if (this.pacman.x >= this.width) this.pacman.x = 0;

    // Update mouth animation
    this.pacman.mouthAngle = Math.abs(Math.sin(this.time * 8)) * 40;

    // Eat dots
    const currentTileX = Math.floor(this.pacman.x / 4);
    const currentTileY = Math.floor(this.pacman.y / 4);

    if (this.maze[currentTileY] && this.maze[currentTileY][currentTileX] === 2) {
      this.maze[currentTileY][currentTileX] = 0;
      this.score += 10;
      this.dotsRemaining--;
    } else if (this.maze[currentTileY] && this.maze[currentTileY][currentTileX] === 3) {
      // Power pellet eaten
      this.maze[currentTileY][currentTileX] = 0;
      this.score += 50;
      this.dotsRemaining--;
      this.powerMode = true;
      this.powerModeTimer = 300; // About 4 seconds at 75fps
      this.ghosts.forEach(ghost => ghost.mode = 'frightened');
    }
  }

  findNearestDot() {
    let nearestDot = null;
    let minDistance = Infinity;
    const pacTileX = Math.floor(this.pacman.x / 4);
    const pacTileY = Math.floor(this.pacman.y / 4);

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 32; x++) {
        if (this.maze[y] && (this.maze[y][x] === 2 || this.maze[y][x] === 3)) {
          const distance = Math.abs(x - pacTileX) + Math.abs(y - pacTileY);
          if (distance < minDistance) {
            minDistance = distance;
            nearestDot = { x, y };
          }
        }
      }
    }

    this.pacman.targetDot = nearestDot;
  }

  updateGhost(ghost) {
    // Different AI behaviors based on ghost name and mode
    const tileX = Math.floor(ghost.x / 4);
    const tileY = Math.floor(ghost.y / 4);
    const pixelX = ghost.x % 4;
    const pixelY = ghost.y % 4;

    // Update target based on mode and personality
    if (this.frameCount % 30 === 0 || (pixelX < 1 && pixelY < 1)) {
      if (ghost.mode === 'frightened') {
        // Run away from Pacman when frightened
        ghost.targetX = ghost.x > this.pacman.x ? 32 * 4 : 0;
        ghost.targetY = ghost.y > this.pacman.y ? 16 * 4 : 0;
      } else if (ghost.mode === 'scatter') {
        // Go to corners
        switch(ghost.name) {
          case 'blinky': ghost.targetX = 120; ghost.targetY = 0; break;
          case 'pinky': ghost.targetX = 0; ghost.targetY = 0; break;
          case 'inky': ghost.targetX = 120; ghost.targetY = 60; break;
          case 'clyde': ghost.targetX = 0; ghost.targetY = 60; break;
        }
      } else {
        // Chase mode - each ghost has different behavior
        switch(ghost.name) {
          case 'blinky': // Direct chase
            ghost.targetX = this.pacman.x;
            ghost.targetY = this.pacman.y;
            break;
          case 'pinky': // Ambush - target ahead of Pacman
            const ahead = 16;
            ghost.targetX = this.pacman.x + (this.pacman.direction === 0 ? ahead : this.pacman.direction === 2 ? -ahead : 0);
            ghost.targetY = this.pacman.y + (this.pacman.direction === 1 ? ahead : this.pacman.direction === 3 ? -ahead : 0);
            break;
          case 'inky': // Unpredictable
            ghost.targetX = this.pacman.x + (Math.random() - 0.5) * 32;
            ghost.targetY = this.pacman.y + (Math.random() - 0.5) * 32;
            break;
          case 'clyde': // Shy - chase when far, scatter when close
            const dist = Math.sqrt(Math.pow(ghost.x - this.pacman.x, 2) + Math.pow(ghost.y - this.pacman.y, 2));
            if (dist > 32) {
              ghost.targetX = this.pacman.x;
              ghost.targetY = this.pacman.y;
            } else {
              ghost.targetX = 0;
              ghost.targetY = 60;
            }
            break;
        }
      }
    }

    // Choose direction toward target at intersections
    if (pixelX < 1 && pixelY < 1) {
      let bestDirection = ghost.direction;
      let minDistance = Infinity;

      for (let dir = 0; dir < 4; dir++) {
        // Don't reverse direction
        if ((dir + 2) % 4 === ghost.direction) continue;

        const nextX = tileX + (dir === 0 ? 1 : dir === 2 ? -1 : 0);
        const nextY = tileY + (dir === 1 ? 1 : dir === 3 ? -1 : 0);

        if (this.canMoveTile(nextX, nextY)) {
          const dist = Math.abs(nextX * 4 - ghost.targetX) + Math.abs(nextY * 4 - ghost.targetY);
          if (dist < minDistance) {
            minDistance = dist;
            bestDirection = dir;
          }
        }
      }

      ghost.direction = bestDirection;
    }

    // Move ghost
    const moveX = ghost.direction === 0 ? ghost.speed :
                  ghost.direction === 2 ? -ghost.speed : 0;
    const moveY = ghost.direction === 1 ? ghost.speed :
                  ghost.direction === 3 ? -ghost.speed : 0;

    const newX = ghost.x + moveX;
    const newY = ghost.y + moveY;
    const newTileX = Math.floor(newX / 4);
    const newTileY = Math.floor(newY / 4);

    if (this.canMoveTile(newTileX, newTileY)) {
      ghost.x = newX;
      ghost.y = newY;
    }

    // Wrap around screen edges
    if (ghost.x < 0) ghost.x = this.width - 1;
    if (ghost.x >= this.width) ghost.x = 0;

    // Toggle between chase and scatter modes periodically
    if (!this.powerMode && this.frameCount % 600 === 0) {
      ghost.mode = ghost.mode === 'chase' ? 'scatter' : 'chase';
    }
  }

  canMoveTile(tileX, tileY) {
    return tileY >= 0 && tileY < 16 &&
           tileX >= 0 && tileX < 32 &&
           (!this.maze[tileY] || this.maze[tileY][tileX] !== 1);
  }

  checkCollisions() {
    // Check Pac-Man vs ghosts
    this.ghosts.forEach(ghost => {
      const dx = Math.abs(this.pacman.x - ghost.x);
      const dy = Math.abs(this.pacman.y - ghost.y);

      if (dx < 4 && dy < 4) {
        if (ghost.mode === 'frightened') {
          // Eat the ghost
          this.score += 200;
          // Send ghost back to center
          ghost.x = 64;
          ghost.y = 32;
          ghost.mode = 'scatter';
        } else {
          // Pacman caught - respawn
          this.pacman.x = 64;
          this.pacman.y = 48;
          // Flash effect
          this.pacman.animFrame = 10;
        }
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

    // Draw UI
    this.drawUI();
  }

  drawMaze() {
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 32; col++) {
        if (!this.maze[row]) continue;

        const x = col * 4;
        const y = row * 4;

        switch (this.maze[row][col]) {
          case 1: // Wall
            this.ctx.fillStyle = '#0033FF';
            this.ctx.fillRect(x, y, 4, 4);
            // Add border for classic look
            this.ctx.fillStyle = '#0088FF';
            this.ctx.fillRect(x, y, 4, 1);
            this.ctx.fillRect(x, y, 1, 4);
            break;
          case 2: // Dot
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.fillRect(x + 1, y + 1, 2, 2);
            break;
          case 3: // Power pellet
            const pulse = Math.sin(this.time * 6) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
            this.ctx.fillRect(x, y, 4, 4);
            break;
        }
      }
    }
  }

  drawPacman() {
    const x = Math.floor(this.pacman.x);
    const y = Math.floor(this.pacman.y);
    const centerX = x + 4;
    const centerY = y + 4;
    const radius = 3.5;

    this.ctx.fillStyle = '#FFFF00';
    this.ctx.beginPath();

    // Calculate mouth opening based on direction
    const mouthAngle = this.pacman.mouthAngle * Math.PI / 180;
    let startAngle = 0;
    let endAngle = 2 * Math.PI;

    if (this.pacman.mouthAngle > 5) {
      switch(this.pacman.direction) {
        case 0: // Right
          startAngle = mouthAngle / 2;
          endAngle = 2 * Math.PI - mouthAngle / 2;
          break;
        case 1: // Down
          startAngle = Math.PI / 2 + mouthAngle / 2;
          endAngle = Math.PI / 2 - mouthAngle / 2 + 2 * Math.PI;
          break;
        case 2: // Left
          startAngle = Math.PI + mouthAngle / 2;
          endAngle = Math.PI - mouthAngle / 2 + 2 * Math.PI;
          break;
        case 3: // Up
          startAngle = 3 * Math.PI / 2 + mouthAngle / 2;
          endAngle = 3 * Math.PI / 2 - mouthAngle / 2 + 2 * Math.PI;
          break;
      }
    }

    // Draw Pacman arc
    this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);

    if (this.pacman.mouthAngle > 5) {
      this.ctx.lineTo(centerX, centerY);
    }

    this.ctx.fill();
  }

  drawGhost(ghost) {
    const x = Math.floor(ghost.x);
    const y = Math.floor(ghost.y);

    // Change color if frightened
    let ghostColor = ghost.color;
    if (ghost.mode === 'frightened') {
      ghostColor = this.powerModeTimer > 60 ? '#0000FF' :
                  (this.frameCount % 10 < 5) ? '#0000FF' : '#FFFFFF';
    }

    this.ctx.fillStyle = ghostColor;

    // Ghost body (rounded top)
    this.ctx.fillRect(x, y + 2, 8, 6); // main body
    this.ctx.fillRect(x + 1, y + 1, 6, 1); // top curve
    this.ctx.fillRect(x + 2, y, 4, 1); // top

    // Ghost bottom (wavy)
    const wave = Math.floor(this.time * 4) % 2;
    if (wave === 0) {
      this.ctx.fillRect(x, y + 8, 2, 1);
      this.ctx.fillRect(x + 3, y + 8, 2, 1);
      this.ctx.fillRect(x + 6, y + 8, 2, 1);
    } else {
      this.ctx.fillRect(x + 1, y + 8, 2, 1);
      this.ctx.fillRect(x + 4, y + 8, 2, 1);
      this.ctx.fillRect(x + 7, y + 8, 1, 1);
    }

    // Ghost eyes
    if (ghost.mode === 'frightened' && this.powerModeTimer < 60 && this.frameCount % 10 >= 5) {
      // Flashing white ghost - no eyes
    } else {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(x + 1, y + 2, 2, 2); // left eye
      this.ctx.fillRect(x + 5, y + 2, 2, 2); // right eye

      // Eye pupils
      this.ctx.fillStyle = '#000000';
      if (ghost.mode === 'frightened') {
        // Scared eyes - pupils down
        this.ctx.fillRect(x + 2, y + 3, 1, 1);
        this.ctx.fillRect(x + 6, y + 3, 1, 1);
      } else {
        // Normal eyes - pupils follow direction
        const pupilOffsetX = ghost.direction === 0 ? 1 : ghost.direction === 2 ? 0 : 0.5;
        const pupilOffsetY = ghost.direction === 1 ? 1 : ghost.direction === 3 ? 0 : 0.5;

        this.ctx.fillRect(x + 1 + pupilOffsetX, y + 2 + pupilOffsetY, 1, 1);
        this.ctx.fillRect(x + 5 + pupilOffsetX, y + 2 + pupilOffsetY, 1, 1);
      }
    }
  }

  drawUI() {
    // Score
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '8px monospace';
    this.ctx.fillText(`SCORE: ${this.score}`, 2, 10);

    // Demo indicator
    this.ctx.fillText('DEMO', this.width - 25, 10);

    // Wave number
    this.ctx.fillText(`WAVE ${this.waveNumber}`, this.width/2 - 15, 10);

    // Power mode indicator
    if (this.powerMode) {
      const powerText = Math.floor(this.powerModeTimer / 75) + 1;
      this.ctx.fillStyle = '#FF00FF';
      this.ctx.fillText(`POWER ${powerText}`, 2, this.height - 2);
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

// Initialize global Pac-Man maze
window.pacmanMaze = new PacmanMaze();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.pacmanMaze) {
    window.pacmanMaze.destroy();
  }
});