class FireEffect {
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

    // Fire buffer - 2D array representing heat values
    this.fireBuffer = [];
    this.fireColors = this.generateFirePalette();

    // Initialize fire buffer
    this.initializeFireBuffer();
  }

  init() {
    this.canvas = document.getElementById('fire-effect-canvas');
    if (!this.canvas) {
      console.error('Fire Effect canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Fire Effect initialized with 75fps targeting');
  }

  generateFirePalette() {
    // Generate fire color palette (256 colors from black to white through red/yellow)
    const palette = [];

    for (let i = 0; i < 256; i++) {
      let r, g, b;

      if (i < 64) {
        // Black to dark red
        r = i * 4;
        g = 0;
        b = 0;
      } else if (i < 128) {
        // Dark red to bright red
        r = 255;
        g = (i - 64) * 4;
        b = 0;
      } else if (i < 192) {
        // Bright red to yellow
        r = 255;
        g = 255;
        b = (i - 128) * 4;
      } else {
        // Yellow to white
        r = 255;
        g = 255;
        b = 255;
      }

      palette[i] = `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
    }

    return palette;
  }

  initializeFireBuffer() {
    // Initialize 2D fire buffer
    this.fireBuffer = [];
    for (let y = 0; y < this.height; y++) {
      this.fireBuffer[y] = [];
      for (let x = 0; x < this.width; x++) {
        if (y === this.height - 1) {
          // Bottom row - fire source with some randomness
          this.fireBuffer[y][x] = Math.random() > 0.2 ? 255 : 0;
        } else {
          this.fireBuffer[y][x] = 0;
        }
      }
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
    // Update fire simulation using classic fire algorithm
    for (let y = 1; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.updateFirePixel(x, y);
      }
    }

    // Update bottom row (fire source) with some animation
    for (let x = 0; x < this.width; x++) {
      const baseIntensity = Math.sin(this.time * 3 + x * 0.2) * 0.3 + 0.7;
      const randomness = Math.random() * 0.4;
      const intensity = Math.max(0, Math.min(1, baseIntensity + randomness));

      // Create more fire in the center
      const centerDistance = Math.abs(x - this.width / 2) / (this.width / 2);
      const centerMultiplier = 1 - centerDistance * 0.5;

      this.fireBuffer[this.height - 1][x] = Math.floor(intensity * centerMultiplier * 255);
    }

    // Add some embers/sparks occasionally
    if (Math.random() < 0.05) {
      this.addSpark();
    }
  }

  updateFirePixel(x, y) {
    // Classic fire effect algorithm
    const left = x > 0 ? this.fireBuffer[y][x - 1] : 0;
    const right = x < this.width - 1 ? this.fireBuffer[y][x + 1] : 0;
    const center = this.fireBuffer[y][x];
    const below = this.fireBuffer[y - 1] ? this.fireBuffer[y - 1][x] : 0;

    // Average surrounding pixels with some cooling
    let newValue = (left + right + center + below) / 4;

    // Cool down the fire (critical for upward movement)
    const cooling = Math.random() * 3 + 1;
    newValue = Math.max(0, newValue - cooling);

    // Add some randomness for flickering
    newValue += (Math.random() - 0.5) * 4;

    // Clamp values
    this.fireBuffer[y][x] = Math.max(0, Math.min(255, Math.floor(newValue)));
  }

  addSpark() {
    // Add a random spark/ember
    const x = Math.floor(Math.random() * this.width);
    const y = Math.floor(Math.random() * (this.height / 2)) + Math.floor(this.height / 2);

    // Create a small bright spot
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          this.fireBuffer[ny][nx] = Math.min(255, this.fireBuffer[ny][nx] + 100);
        }
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw fire effect
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const heat = this.fireBuffer[y][x];

        if (heat > 0) {
          const colorIndex = Math.floor(heat);
          this.ctx.fillStyle = this.fireColors[Math.min(255, colorIndex)];
          this.ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Add some additional visual effects
    this.addFireOverlay();
  }

  addFireOverlay() {
    // Add some additional flame shapes for better visual appeal
    const numFlames = 5;

    for (let i = 0; i < numFlames; i++) {
      const x = (i / (numFlames - 1)) * this.width;
      const flameHeight = 20 + Math.sin(this.time * 4 + i) * 8;
      const flameWidth = 8 + Math.sin(this.time * 3 + i * 2) * 3;

      this.drawFlame(x, this.height - 5, flameWidth, flameHeight);
    }
  }

  drawFlame(x, y, width, height) {
    const segments = Math.floor(height / 3);

    for (let i = 0; i < segments; i++) {
      const segmentY = y - (i * 3);
      const segmentWidth = width * (1 - i / segments) * (0.8 + Math.sin(this.time * 6 + x + i) * 0.2);
      const intensity = 255 * (1 - i / segments);

      if (segmentY >= 0 && segmentY < this.height) {
        const colorIndex = Math.floor(intensity);
        this.ctx.fillStyle = this.fireColors[Math.min(255, colorIndex)];

        // Draw flame segment
        const startX = Math.max(0, Math.floor(x - segmentWidth / 2));
        const endX = Math.min(this.width, Math.floor(x + segmentWidth / 2));

        for (let fx = startX; fx < endX; fx++) {
          if (Math.random() > 0.3) { // Add some randomness to flame edges
            this.ctx.fillRect(fx, segmentY, 1, 2);
          }
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

// Initialize global fire effect
window.fireEffect = new FireEffect();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.fireEffect) {
    window.fireEffect.destroy();
  }
});