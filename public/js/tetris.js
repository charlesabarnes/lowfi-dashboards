class Tetris {
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

    // Game board
    this.boardWidth = 20;
    this.boardHeight = 32;
    this.blockSize = 2;
    this.board = [];
    this.offsetX = 44; // Center the board

    // Current falling piece
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.dropTimer = 0;
    this.dropInterval = 60; // frames

    // Game state
    this.lines = 0;
    this.score = 0;

    // Tetris pieces
    this.pieces = [
      // I piece
      { blocks: [[1,1,1,1]], color: '#00FFFF' },
      // O piece
      { blocks: [[1,1],[1,1]], color: '#FFFF00' },
      // T piece
      { blocks: [[0,1,0],[1,1,1]], color: '#800080' },
      // S piece
      { blocks: [[0,1,1],[1,1,0]], color: '#00FF00' },
      // Z piece
      { blocks: [[1,1,0],[0,1,1]], color: '#FF0000' },
      // J piece
      { blocks: [[1,0,0],[1,1,1]], color: '#0000FF' },
      // L piece
      { blocks: [[0,0,1],[1,1,1]], color: '#FFA500' }
    ];

    this.initializeBoard();
    this.spawnPiece();
  }

  init() {
    this.canvas = document.getElementById('tetris-canvas');
    if (!this.canvas) {
      console.error('Tetris canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Tetris initialized with 75fps targeting');
  }

  initializeBoard() {
    this.board = [];
    for (let y = 0; y < this.boardHeight; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.boardWidth; x++) {
        this.board[y][x] = null;
      }
    }
  }

  spawnPiece() {
    this.currentPiece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
    this.currentX = Math.floor(this.boardWidth / 2) - 1;
    this.currentY = 0;
  }

  rotatePiece(piece) {
    const rotated = [];
    const height = piece.blocks.length;
    const width = piece.blocks[0].length;

    for (let x = 0; x < width; x++) {
      rotated[x] = [];
      for (let y = height - 1; y >= 0; y--) {
        rotated[x][height - 1 - y] = piece.blocks[y][x];
      }
    }

    return { blocks: rotated, color: piece.color };
  }

  canPlacePiece(piece, x, y) {
    for (let py = 0; py < piece.blocks.length; py++) {
      for (let px = 0; px < piece.blocks[py].length; px++) {
        if (piece.blocks[py][px]) {
          const boardX = x + px;
          const boardY = y + py;

          if (boardX < 0 || boardX >= this.boardWidth ||
              boardY >= this.boardHeight ||
              (boardY >= 0 && this.board[boardY][boardX])) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placePiece() {
    for (let py = 0; py < this.currentPiece.blocks.length; py++) {
      for (let px = 0; px < this.currentPiece.blocks[py].length; px++) {
        if (this.currentPiece.blocks[py][px]) {
          const boardX = this.currentX + px;
          const boardY = this.currentY + py;
          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.color;
          }
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;

    for (let y = this.boardHeight - 1; y >= 0; y--) {
      let fullLine = true;
      for (let x = 0; x < this.boardWidth; x++) {
        if (!this.board[y][x]) {
          fullLine = false;
          break;
        }
      }

      if (fullLine) {
        // Remove the line
        this.board.splice(y, 1);
        // Add empty line at top
        this.board.unshift(Array(this.boardWidth).fill(null));
        linesCleared++;
        y++; // Check same line again
      }
    }

    this.lines += linesCleared;
    this.score += linesCleared * 100;
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

    // Control frame rate to 75fps
    if (currentTime - this.lastTime < this.frameTime) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastTime = currentTime;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    this.dropTimer++;

    // Random rotation for visual interest
    if (Math.random() < 0.02) {
      const rotated = this.rotatePiece(this.currentPiece);
      if (this.canPlacePiece(rotated, this.currentX, this.currentY)) {
        this.currentPiece = rotated;
      }
    }

    // Random horizontal movement
    if (Math.random() < 0.03) {
      const direction = Math.random() < 0.5 ? -1 : 1;
      if (this.canPlacePiece(this.currentPiece, this.currentX + direction, this.currentY)) {
        this.currentX += direction;
      }
    }

    // Drop piece
    if (this.dropTimer >= this.dropInterval) {
      if (this.canPlacePiece(this.currentPiece, this.currentX, this.currentY + 1)) {
        this.currentY++;
      } else {
        // Place piece and spawn new one
        this.placePiece();
        this.clearLines();
        this.spawnPiece();

        // Game over check
        if (!this.canPlacePiece(this.currentPiece, this.currentX, this.currentY)) {
          this.initializeBoard();
          this.score = 0;
          this.lines = 0;
        }
      }
      this.dropTimer = 0;
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw board border
    this.ctx.fillStyle = '#444444';
    this.ctx.fillRect(this.offsetX - 1, 0, this.boardWidth * this.blockSize + 2, this.boardHeight * this.blockSize);

    // Draw board background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(this.offsetX, 0, this.boardWidth * this.blockSize, this.boardHeight * this.blockSize);

    // Draw placed blocks
    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        if (this.board[y][x]) {
          this.ctx.fillStyle = this.board[y][x];
          this.ctx.fillRect(
            this.offsetX + x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            this.blockSize
          );

          // Block highlight
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.fillRect(
            this.offsetX + x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            1
          );
          this.ctx.fillRect(
            this.offsetX + x * this.blockSize,
            y * this.blockSize,
            1,
            this.blockSize
          );
        }
      }
    }

    // Draw current falling piece
    if (this.currentPiece) {
      this.ctx.fillStyle = this.currentPiece.color;
      for (let py = 0; py < this.currentPiece.blocks.length; py++) {
        for (let px = 0; px < this.currentPiece.blocks[py].length; px++) {
          if (this.currentPiece.blocks[py][px]) {
            const x = this.offsetX + (this.currentX + px) * this.blockSize;
            const y = (this.currentY + py) * this.blockSize;

            this.ctx.fillRect(x, y, this.blockSize, this.blockSize);

            // Block highlight
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x, y, this.blockSize, 1);
            this.ctx.fillRect(x, y, 1, this.blockSize);
            this.ctx.fillStyle = this.currentPiece.color;
          }
        }
      }
    }

    // Draw score info
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '6px monospace';
    this.ctx.fillText(`Lines: ${this.lines}`, 2, 8);
    this.ctx.fillText(`Score: ${this.score}`, 2, 16);

    // Draw next piece preview (simplified)
    this.ctx.fillStyle = '#666666';
    this.ctx.fillRect(this.width - 20, 2, 18, 18);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(this.width - 19, 3, 16, 16);

    // Simple next piece indicator
    const nextPiece = this.pieces[(this.pieces.indexOf(this.currentPiece) + 1) % this.pieces.length];
    this.ctx.fillStyle = nextPiece.color;
    this.ctx.fillRect(this.width - 16, 6, 2, 2);
    this.ctx.fillRect(this.width - 14, 8, 2, 2);
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
    this.board = [];
  }
}

// Create global instance
window.tetris = new Tetris();