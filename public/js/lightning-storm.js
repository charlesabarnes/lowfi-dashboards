class LightningStorm {
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

    // Storm state
    this.stormIntensity = 0.3;
    this.lightningBolts = [];
    this.thunderClouds = [];
    this.rainDrops = [];

    // Lightning timing
    this.lightningTimer = 0;
    this.nextLightningTime = this.getRandomLightningTime();

    this.initializeClouds();
    this.initializeRain();
  }

  init() {
    this.canvas = document.getElementById('lightning-storm-canvas');
    if (!this.canvas) {
      console.error('Lightning Storm canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Lightning Storm initialized with 75fps targeting');
  }

  initializeClouds() {
    // Create dark storm clouds
    this.thunderClouds = [];
    for (let i = 0; i < 8; i++) {
      this.thunderClouds.push({
        x: Math.random() * (this.width + 40) - 20,
        y: Math.random() * 20,
        width: Math.random() * 30 + 20,
        height: Math.random() * 8 + 6,
        speed: Math.random() * 0.5 + 0.2,
        darkness: Math.random() * 0.3 + 0.7
      });
    }
  }

  initializeRain() {
    // Create initial rain drops
    this.rainDrops = [];
    for (let i = 0; i < 30; i++) {
      this.createRainDrop();
    }
  }

  createRainDrop() {
    this.rainDrops.push({
      x: Math.random() * this.width,
      y: -Math.random() * 30,
      speed: Math.random() * 1.5 + 1,
      length: Math.random() * 3 + 1
    });
  }

  getRandomLightningTime() {
    return Math.random() * 200 + 50; // 50-250 frames between lightning
  }

  createLightningBolt() {
    const startX = Math.random() * this.width;
    const bolt = {
      segments: [],
      life: 0,
      maxLife: 8,
      brightness: 1
    };

    // Generate jagged lightning path
    let currentX = startX;
    let currentY = 15;
    const targetY = this.height - 10;

    while (currentY < targetY) {
      bolt.segments.push({ x: currentX, y: currentY });

      // Add some randomness to the path
      currentX += (Math.random() - 0.5) * 8;
      currentY += Math.random() * 8 + 4;

      // Keep lightning within bounds
      currentX = Math.max(2, Math.min(this.width - 2, currentX));
    }

    // Final segment to ground
    bolt.segments.push({ x: currentX, y: targetY });

    this.lightningBolts.push(bolt);

    // Sometimes create branching
    if (Math.random() < 0.4 && bolt.segments.length > 3) {
      this.createLightningBranch(bolt.segments[Math.floor(bolt.segments.length / 2)]);
    }
  }

  createLightningBranch(startPoint) {
    const branch = {
      segments: [startPoint],
      life: 0,
      maxLife: 6,
      brightness: 0.7
    };

    let currentX = startPoint.x;
    let currentY = startPoint.y;
    const branchLength = Math.random() * 20 + 10;

    for (let i = 0; i < branchLength && currentY < this.height - 5; i += 4) {
      currentX += (Math.random() - 0.5) * 6;
      currentY += Math.random() * 4 + 2;
      currentX = Math.max(0, Math.min(this.width, currentX));

      branch.segments.push({ x: currentX, y: currentY });
    }

    this.lightningBolts.push(branch);
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
    // Update lightning timing
    this.lightningTimer++;
    if (this.lightningTimer >= this.nextLightningTime) {
      this.createLightningBolt();
      this.lightningTimer = 0;
      this.nextLightningTime = this.getRandomLightningTime();
    }

    // Update lightning bolts
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const bolt = this.lightningBolts[i];
      bolt.life++;
      bolt.brightness = 1 - (bolt.life / bolt.maxLife);

      if (bolt.life >= bolt.maxLife) {
        this.lightningBolts.splice(i, 1);
      }
    }

    // Update clouds
    this.thunderClouds.forEach(cloud => {
      cloud.x += cloud.speed;

      // Wrap around
      if (cloud.x > this.width + 20) {
        cloud.x = -cloud.width - 20;
        cloud.y = Math.random() * 20;
        cloud.speed = Math.random() * 0.5 + 0.2;
      }
    });

    // Update rain
    for (let i = this.rainDrops.length - 1; i >= 0; i--) {
      const drop = this.rainDrops[i];
      drop.y += drop.speed;

      if (drop.y > this.height) {
        this.rainDrops.splice(i, 1);
        this.createRainDrop();
      }
    }
  }

  render() {
    // Dark stormy sky background
    const isLightning = this.lightningBolts.length > 0;
    this.ctx.fillStyle = isLightning ? '#2a2a4a' : '#0f0f1f';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw dark storm clouds
    this.thunderClouds.forEach(cloud => {
      const darkness = Math.floor(cloud.darkness * 255);
      this.ctx.fillStyle = `rgb(${darkness * 0.3}, ${darkness * 0.3}, ${darkness * 0.4})`;

      // Main cloud body
      this.ctx.fillRect(Math.floor(cloud.x), Math.floor(cloud.y), cloud.width, cloud.height);

      // Cloud variations for more realistic look
      this.ctx.fillRect(Math.floor(cloud.x + 5), Math.floor(cloud.y - 2), cloud.width - 10, cloud.height - 3);
      this.ctx.fillRect(Math.floor(cloud.x + 8), Math.floor(cloud.y + cloud.height - 2), cloud.width - 16, 3);
    });

    // Draw rain
    this.ctx.fillStyle = '#4a6fa5';
    this.rainDrops.forEach(drop => {
      this.ctx.fillRect(Math.floor(drop.x), Math.floor(drop.y), 1, drop.length);
    });

    // Draw lightning bolts
    this.lightningBolts.forEach(bolt => {
      const alpha = bolt.brightness;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = '#ffffff';

      // Draw main bolt
      for (let i = 0; i < bolt.segments.length - 1; i++) {
        const start = bolt.segments[i];
        const end = bolt.segments[i + 1];

        // Draw thick main bolt
        this.ctx.fillRect(Math.floor(start.x) - 1, Math.floor(start.y), 3, Math.floor(end.y - start.y) + 1);

        // Add glow effect with blue tint
        this.ctx.fillStyle = '#8888ff';
        this.ctx.fillRect(Math.floor(start.x) - 2, Math.floor(start.y), 5, Math.floor(end.y - start.y) + 1);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(Math.floor(start.x), Math.floor(start.y), 1, Math.floor(end.y - start.y) + 1);
      }
    });
    this.ctx.globalAlpha = 1;

    // Lightning flash illumination effect
    if (this.lightningBolts.length > 0) {
      this.ctx.globalAlpha = 0.1;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalAlpha = 1;
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
    this.lightningBolts = [];
    this.thunderClouds = [];
    this.rainDrops = [];
  }
}

// Create global instance
window.lightningStorm = new LightningStorm();