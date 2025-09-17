class SnakeGame {
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

    // Game settings
    this.gridSize = 4;
    this.moveTimer = 0;
    this.moveInterval = 15; // frames between moves

    // Snake
    this.snake = [
      { x: 32, y: 32 },
      { x: 28, y: 32 },
      { x: 24, y: 32 }
    ];
    this.direction = { x: 1, y: 0 };

    // Food
    this.food = { x: 60, y: 28 };
    this.score = 0;

    // AI behavior
    this.aiTimer = 0;
    this.aiDecisionInterval = 30;
  }

  init() {
    this.canvas = document.getElementById('snake-game-canvas');
    if (!this.canvas) {
      console.error('Snake Game canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    this.spawnFood();

    // Start animation
    this.animate();
    console.log('Snake Game initialized with 75fps targeting');
  }

  spawnFood() {
    let validPosition = false;
    while (!validPosition) {
      this.food.x = Math.floor(Math.random() * (this.width / this.gridSize)) * this.gridSize;
      this.food.y = Math.floor(Math.random() * (this.height / this.gridSize)) * this.gridSize;

      validPosition = true;
      // Check if food spawned on snake
      for (let segment of this.snake) {
        if (segment.x === this.food.x && segment.y === this.food.y) {
          validPosition = false;
          break;
        }
      }
    }
  }

  checkCollision(x, y) {
    // Wall collision
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return true;
    }

    // Self collision
    for (let segment of this.snake) {
      if (segment.x === x && segment.y === y) {
        return true;
      }
    }

    return false;
  }

  getDistanceToFood(x, y) {
    return Math.abs(x - this.food.x) + Math.abs(y - this.food.y);
  }

  makeAIDecision() {
    const head = this.snake[0];
    const currentDistance = this.getDistanceToFood(head.x, head.y);

    // Possible moves
    const moves = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }  // left
    ];

    let bestMove = this.direction;
    let bestDistance = currentDistance;
    let bestSafety = -1;

    for (let move of moves) {
      // Don't move backwards
      if (move.x === -this.direction.x && move.y === -this.direction.y) {
        continue;
      }

      const nextX = head.x + move.x * this.gridSize;
      const nextY = head.y + move.y * this.gridSize;

      // Check if move is safe
      if (!this.checkCollision(nextX, nextY)) {
        const distance = this.getDistanceToFood(nextX, nextY);

        // Calculate safety (how many moves ahead we can go)
        let safety = 0;
        let testX = nextX, testY = nextY;
        for (let i = 0; i < 5; i++) {
          testX += move.x * this.gridSize;
          testY += move.y * this.gridSize;
          if (!this.checkCollision(testX, testY)) {
            safety++;
          } else {
            break;
          }
        }

        // Prefer moves that get closer to food and are safer
        if (safety > bestSafety || (safety === bestSafety && distance < bestDistance)) {
          bestMove = move;
          bestDistance = distance;
          bestSafety = safety;
        }
      }
    }

    this.direction = bestMove;
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
    this.moveTimer++;
    this.aiTimer++;

    // AI decision making
    if (this.aiTimer >= this.aiDecisionInterval) {
      this.makeAIDecision();
      this.aiTimer = 0;
    }

    // Move snake
    if (this.moveTimer >= this.moveInterval) {
      const head = this.snake[0];
      const newHead = {
        x: head.x + this.direction.x * this.gridSize,
        y: head.y + this.direction.y * this.gridSize
      };

      // Check collision
      if (this.checkCollision(newHead.x, newHead.y)) {
        // Reset game
        this.snake = [
          { x: 32, y: 32 },
          { x: 28, y: 32 },
          { x: 24, y: 32 }
        ];
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.spawnFood();
      } else {
        this.snake.unshift(newHead);

        // Check if food eaten
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
          this.score++;
          this.spawnFood();
          // Don't remove tail (snake grows)
        } else {
          this.snake.pop(); // Remove tail
        }
      }

      this.moveTimer = 0;
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#001100';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw grid (subtle)
    this.ctx.fillStyle = '#002200';
    for (let x = 0; x < this.width; x += this.gridSize) {
      this.ctx.fillRect(x, 0, 1, this.height);
    }
    for (let y = 0; y < this.height; y += this.gridSize) {
      this.ctx.fillRect(0, y, this.width, 1);
    }

    // Draw food
    this.ctx.fillStyle = '#FF4444';
    this.ctx.fillRect(this.food.x, this.food.y, this.gridSize, this.gridSize);

    // Food pulse effect
    const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
    this.ctx.fillStyle = `rgba(255, 255, 68, ${pulse * 0.8})`;
    this.ctx.fillRect(this.food.x - 1, this.food.y - 1, this.gridSize + 2, this.gridSize + 2);

    // Draw snake
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);

        // Eyes
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(segment.x + 1, segment.y + 1, 1, 1);
        this.ctx.fillRect(segment.x + this.gridSize - 2, segment.y + 1, 1, 1);
      } else {
        // Body
        const alpha = 1 - (index * 0.1);
        this.ctx.globalAlpha = Math.max(alpha, 0.3);
        this.ctx.fillStyle = '#44AA44';
        this.ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);

        // Body segment highlight
        this.ctx.fillStyle = '#66CC66';
        this.ctx.fillRect(segment.x + 1, segment.y + 1, this.gridSize - 2, this.gridSize - 2);
      }
    });
    this.ctx.globalAlpha = 1;

    // Draw score
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '8px monospace';
    this.ctx.fillText(`Score: ${this.score}`, 4, 8);
    this.ctx.fillText(`Length: ${this.snake.length}`, 4, 18);
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
    this.snake = [];
  }
}

// Create global instance
window.snakeGame = new SnakeGame();