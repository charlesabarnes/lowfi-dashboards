class RainEffect {
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

    // Rain drops
    this.rainDrops = [];
    this.maxDrops = 50;

    // Puddles at bottom
    this.puddles = [];
    this.maxPuddles = 15;

    // Lightning flash
    this.lightningTimer = 0;
    this.lightningFlash = false;
    this.lightningDuration = 0;

    this.initializeRain();
  }

  init() {
    this.canvas = document.getElementById('rain-effect-canvas');
    if (!this.canvas) {
      console.error('Rain Effect canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Rain Effect initialized with 75fps targeting');
  }

  initializeRain() {
    // Create initial rain drops
    for (let i = 0; i < this.maxDrops; i++) {
      this.createRainDrop();
    }
  }

  createRainDrop() {
    this.rainDrops.push({
      x: Math.random() * this.width,
      y: -Math.random() * 50,
      speed: Math.random() * 2 + 1.5,
      length: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.5
    });
  }

  createPuddle(x, y) {
    // Create ripple effect
    this.puddles.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: Math.random() * 8 + 4,
      life: 0,
      maxLife: 30
    });

    // Remove old puddles
    if (this.puddles.length > this.maxPuddles) {
      this.puddles.shift();
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

    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    // Update rain drops
    for (let i = this.rainDrops.length - 1; i >= 0; i--) {
      const drop = this.rainDrops[i];
      drop.y += drop.speed;

      // Check if drop hit the ground
      if (drop.y > this.height - 5) {
        // Create puddle ripple
        this.createPuddle(drop.x, this.height - 3);

        // Remove drop and create new one
        this.rainDrops.splice(i, 1);
        this.createRainDrop();
      }
    }

    // Update puddles
    for (let i = this.puddles.length - 1; i >= 0; i--) {
      const puddle = this.puddles[i];
      puddle.life++;
      puddle.radius = (puddle.life / puddle.maxLife) * puddle.maxRadius;

      if (puddle.life > puddle.maxLife) {
        this.puddles.splice(i, 1);
      }
    }

    // Lightning timer
    this.lightningTimer++;
    if (this.lightningTimer > 300 + Math.random() * 400) {
      this.lightningFlash = true;
      this.lightningDuration = 0;
      this.lightningTimer = 0;
    }

    if (this.lightningFlash) {
      this.lightningDuration++;
      if (this.lightningDuration > 3) {
        this.lightningFlash = false;
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = this.lightningFlash ? '#1a1a2e' : '#0a0a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw clouds at top
    this.ctx.fillStyle = '#2d2d4a';
    for (let i = 0; i < 5; i++) {
      const x = (i * 30) - 10 + Math.sin(Date.now() * 0.001 + i) * 3;
      const y = 2 + Math.sin(Date.now() * 0.0015 + i) * 2;
      this.ctx.fillRect(x, y, 25, 8);
      this.ctx.fillRect(x + 5, y - 3, 15, 6);
    }

    // Lightning flash
    if (this.lightningFlash) {
      this.ctx.fillStyle = '#ffffff';
      const lightningX = Math.random() * this.width;
      this.ctx.fillRect(lightningX - 1, 0, 2, 15);
      this.ctx.fillRect(lightningX - 3, 8, 6, 2);
      this.ctx.fillRect(lightningX + 2, 12, 3, 8);
    }

    // Draw rain drops
    this.ctx.fillStyle = '#4a90e2';
    this.rainDrops.forEach(drop => {
      this.ctx.globalAlpha = drop.opacity;
      this.ctx.fillRect(Math.floor(drop.x), Math.floor(drop.y), 1, drop.length);
    });
    this.ctx.globalAlpha = 1;

    // Draw puddle ripples
    this.puddles.forEach(puddle => {
      const alpha = 1 - (puddle.life / puddle.maxLife);
      this.ctx.globalAlpha = alpha * 0.6;
      this.ctx.fillStyle = '#6bb6ff';

      // Draw ripple as small rectangles
      const circumference = Math.PI * 2 * puddle.radius;
      const points = Math.max(8, Math.floor(circumference / 2));

      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const x = puddle.x + Math.cos(angle) * puddle.radius;
        const y = puddle.y + Math.sin(angle) * puddle.radius * 0.3; // Flatten vertically

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
        }
      }
    });
    this.ctx.globalAlpha = 1;

    // Draw ground/water surface
    this.ctx.fillStyle = '#1a2f4a';
    this.ctx.fillRect(0, this.height - 3, this.width, 3);
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
    this.rainDrops = [];
    this.puddles = [];
  }
}

// Create global instance
window.rainEffect = new RainEffect();