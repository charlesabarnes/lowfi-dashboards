class GameOfLife {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Grid configuration
    this.cellSize = 2;
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);
    this.grid = [];
    this.nextGrid = [];

    // Animation timing
    this.generationDelay = 15; // frames between generations
    this.frameCount = 0;
    this.generation = 0;
    this.maxGenerations = 200; // Reset after this many generations

    // Colors for cell age/state
    this.colors = [
      '#000000', // Dead
      '#00FF00', // New born
      '#00DD00', // Young
      '#00BB00', // Adult
      '#009900', // Mature
      '#007700', // Old
      '#005500', // Ancient
      '#003300'  // Very old
    ];

    this.cellAges = []; // Track how long cells have been alive

    this.lastTime = 0;
    this.frameRate = 13; // ~75fps (1000ms / 75fps ≈ 13ms)
  }

  init() {
    this.canvas = document.getElementById('life-canvas');
    if (!this.canvas) {
      console.error('Game of Life canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    this.initializeGrid();
    this.seedPattern();
    this.animate();
    console.log('Game of Life initialized');
  }

  initializeGrid() {
    // Initialize grids
    this.grid = [];
    this.nextGrid = [];
    this.cellAges = [];

    for (let y = 0; y < this.rows; y++) {
      this.grid[y] = [];
      this.nextGrid[y] = [];
      this.cellAges[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.grid[y][x] = 0;
        this.nextGrid[y][x] = 0;
        this.cellAges[y][x] = 0;
      }
    }
  }

  seedPattern() {
    // Clear the grid first
    this.initializeGrid();

    // Choose a random pattern
    const patterns = ['glider-guns', 'random', 'oscillators', 'spaceships'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    switch (pattern) {
      case 'glider-guns':
        this.seedGliderGuns();
        break;
      case 'random':
        this.seedRandom();
        break;
      case 'oscillators':
        this.seedOscillators();
        break;
      case 'spaceships':
        this.seedSpaceships();
        break;
    }

    this.generation = 0;
  }

  seedGliderGuns() {
    // Place some glider guns (simplified)
    const patterns = [
      // Small glider gun pattern
      [[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
       [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
       [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
       [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1]]
    ];

    // Place pattern in center
    const startY = Math.floor((this.rows - patterns[0].length) / 2);
    const startX = Math.floor((this.cols - patterns[0][0].length) / 2);

    for (let y = 0; y < patterns[0].length; y++) {
      for (let x = 0; x < patterns[0][y].length; x++) {
        if (startY + y < this.rows && startX + x < this.cols) {
          this.grid[startY + y][startX + x] = patterns[0][y][x];
        }
      }
    }
  }

  seedRandom() {
    // Random seed with 30% density
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.grid[y][x] = Math.random() < 0.3 ? 1 : 0;
      }
    }
  }

  seedOscillators() {
    // Place various oscillators
    this.placeBlinker(10, 10);
    this.placeBlinker(20, 15);
    this.placeToad(30, 20);
    this.placeBeacon(40, 25);
  }

  seedSpaceships() {
    // Place gliders
    this.placeGlider(5, 5);
    this.placeGlider(15, 10);
    this.placeGlider(25, 15);
  }

  placeBlinker(x, y) {
    if (x + 2 < this.cols && y < this.rows) {
      this.grid[y][x] = 1;
      this.grid[y][x + 1] = 1;
      this.grid[y][x + 2] = 1;
    }
  }

  placeToad(x, y) {
    if (x + 3 < this.cols && y + 1 < this.rows) {
      this.grid[y][x + 1] = 1;
      this.grid[y][x + 2] = 1;
      this.grid[y][x + 3] = 1;
      this.grid[y + 1][x] = 1;
      this.grid[y + 1][x + 1] = 1;
      this.grid[y + 1][x + 2] = 1;
    }
  }

  placeBeacon(x, y) {
    if (x + 3 < this.cols && y + 3 < this.rows) {
      this.grid[y][x] = 1;
      this.grid[y][x + 1] = 1;
      this.grid[y + 1][x] = 1;
      this.grid[y + 2][x + 2] = 1;
      this.grid[y + 2][x + 3] = 1;
      this.grid[y + 3][x + 2] = 1;
      this.grid[y + 3][x + 3] = 1;
    }
  }

  placeGlider(x, y) {
    if (x + 2 < this.cols && y + 2 < this.rows) {
      this.grid[y][x + 1] = 1;
      this.grid[y + 1][x + 2] = 1;
      this.grid[y + 2][x] = 1;
      this.grid[y + 2][x + 1] = 1;
      this.grid[y + 2][x + 2] = 1;
    }
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

  update() {
    // Update generation
    if (this.frameCount % this.generationDelay === 0) {
      this.nextGeneration();
      this.generation++;

      // Reset if max generations reached or if pattern becomes stable
      if (this.generation >= this.maxGenerations || this.isStablePattern()) {
        this.seedPattern();
      }
    }
  }

  nextGeneration() {
    // Apply Conway's Game of Life rules
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const neighbors = this.countNeighbors(x, y);
        const currentCell = this.grid[y][x];

        if (currentCell === 1) {
          // Cell is alive
          if (neighbors < 2) {
            // Dies from underpopulation
            this.nextGrid[y][x] = 0;
            this.cellAges[y][x] = 0;
          } else if (neighbors === 2 || neighbors === 3) {
            // Survives
            this.nextGrid[y][x] = 1;
            this.cellAges[y][x] = Math.min(this.cellAges[y][x] + 1, this.colors.length - 1);
          } else {
            // Dies from overpopulation
            this.nextGrid[y][x] = 0;
            this.cellAges[y][x] = 0;
          }
        } else {
          // Cell is dead
          if (neighbors === 3) {
            // Birth
            this.nextGrid[y][x] = 1;
            this.cellAges[y][x] = 1;
          } else {
            // Stays dead
            this.nextGrid[y][x] = 0;
            this.cellAges[y][x] = 0;
          }
        }
      }
    }

    // Swap grids
    const temp = this.grid;
    this.grid = this.nextGrid;
    this.nextGrid = temp;
  }

  countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        // Wrap around edges (toroidal topology)
        const wrappedX = (nx + this.cols) % this.cols;
        const wrappedY = (ny + this.rows) % this.rows;

        if (this.grid[wrappedY][wrappedX] === 1) {
          count++;
        }
      }
    }
    return count;
  }

  isStablePattern() {
    // Simple stability check - count living cells
    let livingCells = 0;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === 1) {
          livingCells++;
        }
      }
    }
    return livingCells < 5; // Consider stable if very few cells remain
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw cells
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === 1) {
          const age = Math.min(this.cellAges[y][x], this.colors.length - 1);
          this.ctx.fillStyle = this.colors[age + 1]; // +1 to skip dead color

          this.ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
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

// Initialize global Game of Life
window.gameOfLife = new GameOfLife();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.gameOfLife) {
    window.gameOfLife.destroy();
  }
});