class BreakoutArkanoid {
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

    // Game elements
    this.paddle = {
      x: 50,
      y: 55,
      width: 20,
      height: 4,
      speed: 2,
      direction: 1
    };

    this.ball = {
      x: 60,
      y: 45,
      vx: 1.5,
      vy: -1.2,
      size: 3,
      width: 3,
      height: 3,
      trail: []
    };

    this.blocks = [];
    this.particles = [];
    this.score = 0;

    this.initializeBlocks();
  }

  init() {
    this.canvas = document.getElementById('breakout-arkanoid-canvas');
    if (!this.canvas) {
      console.error('Breakout Arkanoid canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Breakout Arkanoid initialized with 75fps targeting');
  }

  initializeBlocks() {
    this.blocks = [];
    const colors = ['#ff4444', '#ff8844', '#ffff44', '#44ff44', '#4488ff', '#8844ff'];

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10; col++) {
        this.blocks.push({
          x: col * 12 + 4,
          y: row * 6 + 8,
          width: 10,
          height: 4,
          color: colors[row],
          destroyed: false,
          hit: false
        });
      }
    }
  }

  createParticle(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 30,
        maxLife: 30,
        color: color,
        size: Math.random() * 2 + 1
      });
    }
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
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
    // Update paddle (AI movement)
    this.paddle.x += this.paddle.speed * this.paddle.direction;

    if (this.paddle.x <= 0 || this.paddle.x + this.paddle.width >= this.width) {
      this.paddle.direction *= -1;
    }

    this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));

    // Update ball trail
    this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
    if (this.ball.trail.length > 5) {
      this.ball.trail.shift();
    }

    // Update ball position
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Ball collision with walls
    if (this.ball.x <= 0 || this.ball.x + this.ball.width >= this.width) {
      this.ball.vx *= -1;
      this.ball.x = Math.max(0, Math.min(this.width - this.ball.width, this.ball.x));
    }

    if (this.ball.y <= 0) {
      this.ball.vy *= -1;
      this.ball.y = 0;
    }

    // Ball collision with paddle
    if (this.checkCollision(this.ball, this.paddle)) {
      this.ball.vy = -Math.abs(this.ball.vy);
      this.ball.y = this.paddle.y - this.ball.height;

      // Add some angle based on where it hits the paddle
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width - 0.5;
      this.ball.vx += hitPos * 0.5;

      // Create paddle hit particles
      this.createParticle(this.ball.x, this.ball.y, '#ffffff');
    }

    // Ball collision with blocks
    for (let block of this.blocks) {
      if (!block.destroyed && this.checkCollision(this.ball, block)) {
        block.destroyed = true;
        block.hit = true;
        this.ball.vy *= -1;
        this.score += 10;

        // Create block destruction particles
        this.createParticle(block.x + block.width/2, block.y + block.height/2, block.color);
        break;
      }
    }

    // Reset ball if it goes off bottom
    if (this.ball.y > this.height) {
      this.ball.x = this.width / 2;
      this.ball.y = this.height / 2;
      this.ball.vx = (Math.random() - 0.5) * 2;
      this.ball.vy = -Math.abs(this.ball.vy);
    }

    // Reset blocks if all destroyed
    const remainingBlocks = this.blocks.filter(block => !block.destroyed);
    if (remainingBlocks.length === 0) {
      setTimeout(() => {
        this.initializeBlocks();
        this.score = 0;
      }, 1000);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      particle.vx *= 0.98; // Friction
      particle.vy *= 0.98;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ball trail
    this.ball.trail.forEach((pos, index) => {
      const alpha = (index + 1) / this.ball.trail.length;
      this.ctx.globalAlpha = alpha * 0.5;
      this.ctx.fillStyle = '#88ccff';
      this.ctx.fillRect(Math.floor(pos.x), Math.floor(pos.y), 2, 2);
    });
    this.ctx.globalAlpha = 1;

    // Draw blocks
    this.blocks.forEach(block => {
      if (!block.destroyed) {
        this.ctx.fillStyle = block.color;
        this.ctx.fillRect(block.x, block.y, block.width, block.height);

        // Block highlight
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(block.x, block.y, block.width, 1);
        this.ctx.fillRect(block.x, block.y, 1, block.height);
      }
    });

    // Draw paddle
    this.ctx.fillStyle = '#00ff88';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

    // Paddle highlight
    this.ctx.fillStyle = '#88ffcc';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, 1);

    // Draw ball
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(Math.floor(this.ball.x), Math.floor(this.ball.y), this.ball.size, this.ball.size);

    // Ball glow
    this.ctx.fillStyle = '#ccccff';
    this.ctx.fillRect(Math.floor(this.ball.x) - 1, Math.floor(this.ball.y) - 1, this.ball.size + 2, this.ball.size + 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(Math.floor(this.ball.x), Math.floor(this.ball.y), this.ball.size, this.ball.size);

    // Draw particles
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(Math.floor(particle.x), Math.floor(particle.y), particle.size, particle.size);
    });
    this.ctx.globalAlpha = 1;

    // Draw score
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(`Score: ${this.score}`, 4, 10);
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
    this.blocks = [];
    this.particles = [];
  }
}

// Create global instance
window.breakoutArkanoid = new BreakoutArkanoid();