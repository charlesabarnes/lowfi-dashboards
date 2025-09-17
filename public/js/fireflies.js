class Fireflies {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    this.targetFPS = 75;
    this.frameTime = 1000 / this.targetFPS;
    this.lastTime = 0;

    this.fireflies = [];
    this.initializeFireflies();
  }

  init() {
    this.canvas = document.getElementById('fireflies-canvas');
    if (!this.canvas) {
      console.error('Fireflies canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.animate();
    console.log('Fireflies initialized with 75fps targeting');
  }

  initializeFireflies() {
    for (let i = 0; i < 15; i++) {
      this.fireflies.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        brightness: 0,
        glowPhase: Math.random() * Math.PI * 2,
        glowSpeed: 0.1 + Math.random() * 0.05,
        isGlowing: false,
        glowTimer: 0,
        glowDuration: 30 + Math.random() * 40
      });
    }
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

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
    this.fireflies.forEach(firefly => {
      // Movement
      firefly.x += firefly.vx;
      firefly.y += firefly.vy;

      // Gentle direction changes
      if (Math.random() < 0.02) {
        firefly.vx += (Math.random() - 0.5) * 0.5;
        firefly.vy += (Math.random() - 0.5) * 0.5;
        firefly.vx = Math.max(-1.5, Math.min(1.5, firefly.vx));
        firefly.vy = Math.max(-1.5, Math.min(1.5, firefly.vy));
      }

      // Wrap around edges
      if (firefly.x < 0) firefly.x = this.width;
      if (firefly.x > this.width) firefly.x = 0;
      if (firefly.y < 0) firefly.y = this.height;
      if (firefly.y > this.height) firefly.y = 0;

      // Glow behavior
      if (!firefly.isGlowing && Math.random() < 0.01) {
        firefly.isGlowing = true;
        firefly.glowTimer = 0;
      }

      if (firefly.isGlowing) {
        firefly.glowTimer++;
        firefly.glowPhase += firefly.glowSpeed;

        if (firefly.glowTimer < firefly.glowDuration) {
          firefly.brightness = Math.sin(firefly.glowPhase) * 0.5 + 0.5;
        } else {
          firefly.isGlowing = false;
          firefly.brightness = 0;
          firefly.glowDuration = 30 + Math.random() * 40;
        }
      }
    });
  }

  render() {
    // Dark night background
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw some grass silhouettes
    this.ctx.fillStyle = '#001100';
    for (let x = 0; x < this.width; x += 8) {
      const height = Math.random() * 8 + 4;
      this.ctx.fillRect(x, this.height - height, 2, height);
    }

    // Draw fireflies
    this.fireflies.forEach(firefly => {
      if (firefly.brightness > 0) {
        // Outer glow
        this.ctx.globalAlpha = firefly.brightness * 0.3;
        this.ctx.fillStyle = '#FFFF88';
        this.ctx.fillRect(Math.floor(firefly.x) - 2, Math.floor(firefly.y) - 2, 5, 5);

        // Inner glow
        this.ctx.globalAlpha = firefly.brightness * 0.6;
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(Math.floor(firefly.x) - 1, Math.floor(firefly.y) - 1, 3, 3);

        // Core
        this.ctx.globalAlpha = firefly.brightness;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(Math.floor(firefly.x), Math.floor(firefly.y), 1, 1);
      } else {
        // Dim firefly body when not glowing
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = '#444444';
        this.ctx.fillRect(Math.floor(firefly.x), Math.floor(firefly.y), 1, 1);
      }
    });
    this.ctx.globalAlpha = 1;
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
    this.fireflies = [];
  }
}

window.fireflies = new Fireflies();