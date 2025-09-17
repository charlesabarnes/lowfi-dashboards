class ChristmasTree {
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

    // Tree lights
    this.lights = [];
    this.initializeLights();

    // Snowflakes
    this.snowflakes = [];
    this.initializeSnowflakes();

    // Christmas colors
    this.colors = {
      tree: '#0F4B0F',        // Dark Green
      treeLight: '#228B22',   // Forest Green
      trunk: '#8B4513',       // Saddle Brown
      lightRed: '#FF0000',    // Red
      lightGreen: '#00FF00',  // Lime
      lightBlue: '#0080FF',   // Blue
      lightYellow: '#FFFF00', // Yellow
      lightPurple: '#FF00FF', // Magenta
      star: '#FFD700',        // Gold
      snow: '#FFFFFF',        // White
      ground: '#F0F8FF'       // Alice Blue
    };

    // Tree structure
    this.treeSegments = [
      { centerX: 64, topY: 15, width: 12, height: 8 },   // Top
      { centerX: 64, topY: 20, width: 20, height: 10 },  // Middle-top
      { centerX: 64, topY: 27, width: 28, height: 12 },  // Middle
      { centerX: 64, topY: 35, width: 36, height: 14 }   // Bottom
    ];
  }

  init() {
    this.canvas = document.getElementById('christmas-tree-canvas');
    if (!this.canvas) {
      console.error('Christmas Tree canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Christmas Tree initialized with 75fps targeting');
  }

  initializeLights() {
    // Generate lights on the tree in a spiral pattern
    this.lights = [];
    let lightId = 0;

    this.treeSegments.forEach((segment, segmentIndex) => {
      const numLights = Math.floor(segment.width / 6); // Space lights out

      for (let i = 0; i < numLights; i++) {
        const angle = (i / numLights) * Math.PI * 2 + segmentIndex;
        const radius = (segment.width / 2) * (0.6 + Math.random() * 0.3);

        const x = segment.centerX + Math.cos(angle) * radius;
        const y = segment.topY + segment.height * (0.3 + Math.random() * 0.6);

        if (x > 5 && x < this.width - 5 && y > 10 && y < this.height - 15) {
          const colors = [
            this.colors.lightRed,
            this.colors.lightGreen,
            this.colors.lightBlue,
            this.colors.lightYellow,
            this.colors.lightPurple
          ];

          this.lights.push({
            id: lightId++,
            x: Math.floor(x),
            y: Math.floor(y),
            color: colors[Math.floor(Math.random() * colors.length)],
            brightness: 0.5 + Math.random() * 0.5,
            twinkleSpeed: 2 + Math.random() * 4,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    });
  }

  initializeSnowflakes() {
    // Initialize falling snowflakes
    this.snowflakes = [];
    for (let i = 0; i < 25; i++) {
      this.snowflakes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 0.2 + Math.random() * 0.8,
        size: Math.random() > 0.7 ? 2 : 1,
        drift: (Math.random() - 0.5) * 0.3
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
    // Update light twinkling
    this.lights.forEach(light => {
      light.phase += light.twinkleSpeed * 0.016;
      light.brightness = 0.4 + Math.sin(light.phase) * 0.3 + Math.sin(this.time * 3 + light.id) * 0.2;
      light.brightness = Math.max(0.2, Math.min(1.0, light.brightness));
    });

    // Update snowflakes
    this.snowflakes.forEach(flake => {
      flake.y += flake.speed;
      flake.x += flake.drift * Math.sin(this.time * 2 + flake.y * 0.1);

      // Wrap around
      if (flake.y > this.height) {
        flake.y = -5;
        flake.x = Math.random() * this.width;
      }
      if (flake.x < 0) flake.x = this.width;
      if (flake.x > this.width) flake.x = 0;
    });
  }

  render() {
    // Clear canvas with night sky
    this.ctx.fillStyle = '#001122';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ground with snow
    this.ctx.fillStyle = this.colors.ground;
    this.ctx.fillRect(0, this.height - 5, this.width, 5);

    // Draw tree segments
    this.treeSegments.forEach(segment => {
      this.drawTreeSegment(segment);
    });

    // Draw tree trunk
    this.drawTrunk();

    // Draw star on top
    this.drawStar();

    // Draw twinkling lights
    this.lights.forEach(light => {
      this.drawLight(light);
    });

    // Draw falling snow
    this.drawSnowflakes();

    // Draw some background elements
    this.drawMoon();
  }

  drawTreeSegment(segment) {
    const { centerX, topY, width, height } = segment;

    // Draw tree segment as triangle
    for (let y = 0; y < height; y++) {
      const lineWidth = Math.floor((width * (y + 1)) / height);
      const startX = centerX - lineWidth / 2;

      // Main tree color
      this.ctx.fillStyle = this.colors.tree;

      for (let x = 0; x < lineWidth; x++) {
        const pixelX = Math.floor(startX + x);
        const pixelY = topY + y;

        // Add some texture variation
        if (Math.sin(pixelX * 0.5 + pixelY * 0.3) > 0.2) {
          this.ctx.fillStyle = (x % 3 === 0) ? this.colors.treeLight : this.colors.tree;
          this.ctx.fillRect(pixelX, pixelY, 1, 1);
        }
      }
    }
  }

  drawTrunk() {
    const trunkX = 60;
    const trunkY = 49;
    const trunkWidth = 8;
    const trunkHeight = 10;

    this.ctx.fillStyle = this.colors.trunk;
    this.ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);

    // Add trunk texture
    this.ctx.fillStyle = '#654321';
    for (let x = 1; x < trunkWidth - 1; x += 2) {
      this.ctx.fillRect(trunkX + x, trunkY, 1, trunkHeight);
    }
  }

  drawStar() {
    const starX = 64;
    const starY = 8;
    const starSize = 4;

    // Star twinkles
    const starBrightness = 0.7 + Math.sin(this.time * 4) * 0.3;
    const alpha = Math.floor(255 * starBrightness);

    this.ctx.fillStyle = this.colors.star;

    // Draw star shape (simplified as plus and X)
    // Vertical line
    this.ctx.fillRect(starX, starY - starSize, 1, starSize * 2 + 1);
    // Horizontal line
    this.ctx.fillRect(starX - starSize, starY, starSize * 2 + 1, 1);
    // Diagonal lines
    for (let i = 1; i <= starSize - 1; i++) {
      this.ctx.fillRect(starX - i, starY - i, 1, 1);
      this.ctx.fillRect(starX + i, starY - i, 1, 1);
      this.ctx.fillRect(starX - i, starY + i, 1, 1);
      this.ctx.fillRect(starX + i, starY + i, 1, 1);
    }
  }

  drawLight(light) {
    const { x, y, color, brightness } = light;

    if (brightness > 0.3) {
      this.ctx.fillStyle = color;

      // Main light pixel
      this.ctx.fillRect(x, y, 1, 1);

      // Add glow effect for brighter lights
      if (brightness > 0.7) {
        this.ctx.fillRect(x - 1, y, 1, 1);
        this.ctx.fillRect(x + 1, y, 1, 1);
        this.ctx.fillRect(x, y - 1, 1, 1);
        this.ctx.fillRect(x, y + 1, 1, 1);
      }

      // Extra bright sparkle
      if (brightness > 0.9 && Math.random() > 0.8) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  drawSnowflakes() {
    this.ctx.fillStyle = this.colors.snow;

    this.snowflakes.forEach(flake => {
      const x = Math.floor(flake.x);
      const y = Math.floor(flake.y);

      if (x >= 0 && x < this.width && y >= 0 && y < this.height - 5) {
        this.ctx.fillRect(x, y, 1, 1);

        // Larger snowflakes
        if (flake.size === 2) {
          this.ctx.fillRect(x + 1, y, 1, 1);
          this.ctx.fillRect(x, y + 1, 1, 1);
          this.ctx.fillRect(x + 1, y + 1, 1, 1);
        }
      }
    });
  }

  drawMoon() {
    const moonX = 20;
    const moonY = 15;
    const moonSize = 6;

    this.ctx.fillStyle = '#FFFFCC';

    // Draw moon as circle approximation
    for (let y = -moonSize; y <= moonSize; y++) {
      for (let x = -moonSize; x <= moonSize; x++) {
        if (x * x + y * y <= moonSize * moonSize) {
          this.ctx.fillRect(moonX + x, moonY + y, 1, 1);
        }
      }
    }

    // Add some craters
    this.ctx.fillStyle = '#EEEEAA';
    this.ctx.fillRect(moonX - 2, moonY - 1, 1, 1);
    this.ctx.fillRect(moonX + 1, moonY + 2, 1, 1);
    this.ctx.fillRect(moonX, moonY - 3, 1, 1);
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

// Initialize global christmas tree
window.christmasTree = new ChristmasTree();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.christmasTree) {
    window.christmasTree.destroy();
  }
});