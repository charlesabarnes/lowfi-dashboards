class BouncingBalls {
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

    // Balls array
    this.balls = [];

    // Physics settings
    this.gravity = 0.15;
    this.friction = 0.98;
    this.bounce = 0.85;

    // Initialize balls
    this.initializeBalls();
  }

  init() {
    this.canvas = document.getElementById('bouncing-balls-canvas');
    if (!this.canvas) {
      console.error('Bouncing Balls canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Bouncing Balls initialized with 75fps targeting');
  }

  initializeBalls() {
    const colors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FF6600', '#6600FF', '#00FF66', '#FF0066', '#66FF00', '#0066FF'
    ];

    // Create 8 balls with different properties
    for (let i = 0; i < 8; i++) {
      this.balls.push({
        x: Math.random() * (this.width - 20) + 10,
        y: Math.random() * (this.height - 20) + 10,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: Math.random() * 4 + 3,
        color: colors[i % colors.length],
        trail: [], // For trail effect
        maxTrailLength: 8
      });
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
    this.balls.forEach(ball => {
      // Store current position for trail
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > ball.maxTrailLength) {
        ball.trail.shift();
      }

      // Apply gravity
      ball.vy += this.gravity;

      // Apply friction
      ball.vx *= this.friction;
      ball.vy *= this.friction;

      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls
      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * this.bounce;
        // Add some randomness to prevent balls getting stuck in patterns
        ball.vy += (Math.random() - 0.5) * 0.5;
      }
      if (ball.x + ball.radius >= this.width) {
        ball.x = this.width - ball.radius;
        ball.vx = -ball.vx * this.bounce;
        ball.vy += (Math.random() - 0.5) * 0.5;
      }
      if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * this.bounce;
        ball.vx += (Math.random() - 0.5) * 0.5;
      }
      if (ball.y + ball.radius >= this.height) {
        ball.y = this.height - ball.radius;
        ball.vy = -ball.vy * this.bounce;
        ball.vx += (Math.random() - 0.5) * 0.5;
      }

      // Ball-to-ball collisions (simple)
      this.balls.forEach(otherBall => {
        if (ball !== otherBall) {
          const dx = ball.x - otherBall.x;
          const dy = ball.y - otherBall.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = ball.radius + otherBall.radius;

          if (distance < minDistance) {
            // Separate balls
            const overlap = minDistance - distance;
            const separateX = (dx / distance) * (overlap * 0.5);
            const separateY = (dy / distance) * (overlap * 0.5);

            ball.x += separateX;
            ball.y += separateY;
            otherBall.x -= separateX;
            otherBall.y -= separateY;

            // Exchange velocities (simplified elastic collision)
            const tempVx = ball.vx;
            const tempVy = ball.vy;
            ball.vx = otherBall.vx * 0.8;
            ball.vy = otherBall.vy * 0.8;
            otherBall.vx = tempVx * 0.8;
            otherBall.vy = tempVy * 0.8;
          }
        }
      });

      // Add some random impulses occasionally to keep things interesting
      if (Math.random() < 0.001) {
        ball.vx += (Math.random() - 0.5) * 2;
        ball.vy += (Math.random() - 0.5) * 2;
      }

      // Prevent balls from getting too slow
      const minSpeed = 0.1;
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (speed < minSpeed && speed > 0) {
        ball.vx = (ball.vx / speed) * minSpeed;
        ball.vy = (ball.vy / speed) * minSpeed;
      }
    });
  }

  render() {
    // Clear canvas with solid black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw trails first
    this.balls.forEach(ball => {
      this.drawTrail(ball);
    });

    // Draw balls
    this.balls.forEach(ball => {
      this.drawBall(ball);
    });
  }

  drawTrail(ball) {
    if (ball.trail.length < 2) return;

    for (let i = 0; i < ball.trail.length - 1; i++) {
      const alpha = (i / ball.trail.length) * 0.3;
      const size = (i / ball.trail.length) * ball.radius * 0.5;

      // Parse the color to add alpha
      const hex = ball.color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

      const pos = ball.trail[i];
      this.ctx.fillRect(
        Math.floor(pos.x - size),
        Math.floor(pos.y - size),
        Math.ceil(size * 2),
        Math.ceil(size * 2)
      );
    }
  }

  drawBall(ball) {
    this.ctx.fillStyle = ball.color;

    // Draw ball as a filled circle using rectangles (pixel art style)
    const x = Math.floor(ball.x);
    const y = Math.floor(ball.y);
    const r = Math.floor(ball.radius);

    // Simple circle approximation using rectangles
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          this.ctx.fillRect(x + dx, y + dy, 1, 1);
        }
      }
    }

    // Add highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const highlightSize = Math.max(1, Math.floor(r * 0.4));
    this.ctx.fillRect(
      x - Math.floor(r * 0.3),
      y - Math.floor(r * 0.3),
      highlightSize,
      highlightSize
    );
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

// Initialize global bouncing balls
window.bouncingBalls = new BouncingBalls();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.bouncingBalls) {
    window.bouncingBalls.destroy();
  }
});