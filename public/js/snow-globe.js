class SnowGlobe {
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

    // Snow particles
    this.snowflakes = [];
    this.maxSnowflakes = 80;

    // Globe properties
    this.globeCenterX = this.width / 2;
    this.globeCenterY = this.height / 2 + 5;
    this.globeRadius = 28;

    // Winter scene elements
    this.trees = [];
    this.house = { x: 95, y: 45, width: 20, height: 15 };

    this.initializeScene();
  }

  init() {
    this.canvas = document.getElementById('snow-globe-canvas');
    if (!this.canvas) {
      console.error('Snow Globe canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Snow Globe initialized with 75fps targeting');
  }

  initializeScene() {
    // Create trees
    this.trees = [
      { x: 20, y: 45, height: 12, width: 8 },
      { x: 35, y: 42, height: 15, width: 10 },
      { x: 50, y: 48, height: 10, width: 6 },
      { x: 75, y: 44, height: 13, width: 8 }
    ];

    // Create snowflakes
    for (let i = 0; i < this.maxSnowflakes; i++) {
      this.createSnowflake();
    }
  }

  createSnowflake() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (this.globeRadius - 5);

    this.snowflakes.push({
      x: this.globeCenterX + Math.cos(angle) * distance,
      y: this.globeCenterY + Math.sin(angle) * distance,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 0.8 + 0.2,
      size: Math.random() * 2 + 1,
      swirl: Math.random() * Math.PI * 2,
      swirlSpeed: (Math.random() - 0.5) * 0.1
    });
  }

  isInsideGlobe(x, y) {
    const dx = x - this.globeCenterX;
    const dy = y - this.globeCenterY;
    return (dx * dx + dy * dy) <= (this.globeRadius - 2) * (this.globeRadius - 2);
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
    // Update snowflakes
    for (let i = this.snowflakes.length - 1; i >= 0; i--) {
      const flake = this.snowflakes[i];

      // Update swirl
      flake.swirl += flake.swirlSpeed;

      // Apply swirling motion
      flake.x += flake.vx + Math.sin(flake.swirl) * 0.3;
      flake.y += flake.vy;

      // Check if flake is still inside globe
      if (!this.isInsideGlobe(flake.x, flake.y)) {
        // Reset to top of globe
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (this.globeRadius - 10);
        flake.x = this.globeCenterX + Math.cos(angle) * distance;
        flake.y = this.globeCenterY - this.globeRadius + 5;
        flake.vy = Math.random() * 0.8 + 0.2;
      }

      // Reset if flake reaches bottom
      if (flake.y > this.globeCenterY + this.globeRadius - 8) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (this.globeRadius - 10);
        flake.x = this.globeCenterX + Math.cos(angle) * distance;
        flake.y = this.globeCenterY - this.globeRadius + 5;
        flake.vy = Math.random() * 0.8 + 0.2;
      }
    }
  }

  render() {
    // Clear canvas with dark blue winter sky
    this.ctx.fillStyle = '#0d1b2a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw globe base
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(this.globeCenterX - 35, this.globeCenterY + this.globeRadius - 5, 70, 12);

    // Draw globe rim highlight
    this.ctx.fillStyle = '#cd853f';
    this.ctx.fillRect(this.globeCenterX - 35, this.globeCenterY + this.globeRadius - 5, 70, 3);

    // Create clipping region for globe interior
    this.ctx.save();

    // Draw globe interior background (winter sky)
    this.ctx.fillStyle = '#87ceeb';
    this.ctx.fillRect(
      this.globeCenterX - this.globeRadius,
      this.globeCenterY - this.globeRadius,
      this.globeRadius * 2,
      this.globeRadius * 2
    );

    // Draw ground inside globe
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(
      this.globeCenterX - this.globeRadius,
      this.globeCenterY + 10,
      this.globeRadius * 2,
      this.globeRadius
    );

    // Only draw inside the circular globe area
    const gradient = this.ctx.createRadialGradient(
      this.globeCenterX, this.globeCenterY, 0,
      this.globeCenterX, this.globeCenterY, this.globeRadius
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.85, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');

    // Draw trees
    this.trees.forEach(tree => {
      if (this.isInsideGlobe(tree.x + tree.width/2, tree.y)) {
        // Tree trunk
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(tree.x + tree.width/2 - 1, tree.y, 2, tree.height);

        // Tree foliage (simple triangular shape)
        this.ctx.fillStyle = '#228b22';
        this.ctx.fillRect(tree.x, tree.y - 5, tree.width, 3);
        this.ctx.fillRect(tree.x + 1, tree.y - 8, tree.width - 2, 3);
        this.ctx.fillRect(tree.x + 2, tree.y - 11, tree.width - 4, 3);
      }
    });

    // Draw house
    if (this.isInsideGlobe(this.house.x + this.house.width/2, this.house.y)) {
      // House body
      this.ctx.fillStyle = '#cd853f';
      this.ctx.fillRect(this.house.x, this.house.y, this.house.width, this.house.height);

      // Roof
      this.ctx.fillStyle = '#8b0000';
      this.ctx.fillRect(this.house.x - 2, this.house.y - 5, this.house.width + 4, 5);
      this.ctx.fillRect(this.house.x, this.house.y - 8, this.house.width, 3);

      // Door
      this.ctx.fillStyle = '#654321';
      this.ctx.fillRect(this.house.x + 8, this.house.y + 5, 4, 10);

      // Window
      this.ctx.fillStyle = '#ffff99';
      this.ctx.fillRect(this.house.x + 3, this.house.y + 3, 4, 4);
    }

    // Draw snowflakes
    this.ctx.fillStyle = '#ffffff';
    this.snowflakes.forEach(flake => {
      if (this.isInsideGlobe(flake.x, flake.y)) {
        if (flake.size > 1.5) {
          // Larger snowflakes - draw as small cross
          this.ctx.fillRect(Math.floor(flake.x - 1), Math.floor(flake.y), 3, 1);
          this.ctx.fillRect(Math.floor(flake.x), Math.floor(flake.y - 1), 1, 3);
        } else {
          // Small snowflakes - single pixel
          this.ctx.fillRect(Math.floor(flake.x), Math.floor(flake.y), 1, 1);
        }
      }
    });

    this.ctx.restore();

    // Draw globe outline/highlight
    this.drawGlobeOutline();

    // Draw reflection on globe
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(this.globeCenterX - 20, this.globeCenterY - 15, 8, 12);
    this.ctx.fillRect(this.globeCenterX - 18, this.globeCenterY - 18, 4, 8);
  }

  drawGlobeOutline() {
    // Draw globe outline using rectangles to approximate circle
    const points = 64;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const x = this.globeCenterX + Math.cos(angle) * this.globeRadius;
      const y = this.globeCenterY + Math.sin(angle) * this.globeRadius;

      if (i % 3 === 0) { // Sparse outline for LED effect
        this.ctx.fillStyle = '#4169e1';
        this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
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
    this.snowflakes = [];
  }
}

// Create global instance
window.snowGlobe = new SnowGlobe();