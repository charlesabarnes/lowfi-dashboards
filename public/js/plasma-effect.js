class PlasmaEffect {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Plasma parameters
    this.time = 0;
    this.timeStep = 0.08;

    // LED-optimized color palette (solid colors only)
    this.colorPalette = [
      '#FF0000', // Red
      '#FF4000', // Red-Orange
      '#FF8000', // Orange
      '#FFFF00', // Yellow
      '#80FF00', // Yellow-Green
      '#00FF00', // Green
      '#00FF80', // Green-Cyan
      '#00FFFF', // Cyan
      '#0080FF', // Cyan-Blue
      '#0000FF', // Blue
      '#4000FF', // Blue-Purple
      '#8000FF', // Purple
      '#FF00FF', // Magenta
      '#FF0080', // Magenta-Red
      '#FF0040', // Dark Red
      '#800000'  // Very Dark Red
    ];

    // Plasma wave parameters
    this.wave1 = { frequency: 0.02, amplitude: 1.0, offsetX: 0, offsetY: 0 };
    this.wave2 = { frequency: 0.03, amplitude: 0.8, offsetX: 32, offsetY: 16 };
    this.wave3 = { frequency: 0.025, amplitude: 0.9, offsetX: -16, offsetY: 32 };

    this.lastTime = 0;
    this.frameRate = 13; // ~75fps (1000ms / 75fps ≈ 13ms)
  }

  init() {
    this.canvas = document.getElementById('plasma-canvas');
    if (!this.canvas) {
      console.error('Plasma canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Plasma Effect initialized');
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

    // Control frame rate
    if (currentTime - this.lastTime < this.frameRate) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastTime = currentTime;
    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    this.time += this.timeStep;

    // Slowly modify wave parameters for variety
    this.wave1.offsetX = Math.sin(this.time * 0.1) * 20;
    this.wave1.offsetY = Math.cos(this.time * 0.15) * 15;

    this.wave2.offsetX = 32 + Math.sin(this.time * 0.12) * 25;
    this.wave2.offsetY = 16 + Math.cos(this.time * 0.08) * 20;

    this.wave3.offsetX = -16 + Math.sin(this.time * 0.09) * 30;
    this.wave3.offsetY = 32 + Math.cos(this.time * 0.11) * 25;
  }

  calculatePlasmaValue(x, y) {
    // Calculate multiple sine waves and combine them
    const distance1 = Math.sqrt(
      Math.pow(x - this.width/2 - this.wave1.offsetX, 2) +
      Math.pow(y - this.height/2 - this.wave1.offsetY, 2)
    );

    const distance2 = Math.sqrt(
      Math.pow(x - this.width/2 - this.wave2.offsetX, 2) +
      Math.pow(y - this.height/2 - this.wave2.offsetY, 2)
    );

    const distance3 = Math.sqrt(
      Math.pow(x - this.width/2 - this.wave3.offsetX, 2) +
      Math.pow(y - this.height/2 - this.wave3.offsetY, 2)
    );

    // Combine multiple wave functions
    const value1 = Math.sin(distance1 * this.wave1.frequency + this.time) * this.wave1.amplitude;
    const value2 = Math.sin(distance2 * this.wave2.frequency - this.time * 0.8) * this.wave2.amplitude;
    const value3 = Math.sin(distance3 * this.wave3.frequency + this.time * 0.6) * this.wave3.amplitude;

    // Additional interference patterns
    const horizontal = Math.sin(x * 0.1 + this.time * 2) * 0.5;
    const vertical = Math.sin(y * 0.15 - this.time * 1.5) * 0.5;

    // Combine all waves
    const combined = value1 + value2 + value3 + horizontal + vertical;

    // Normalize to 0-1 range
    return (combined + 4) / 8;
  }

  getColorForValue(value) {
    // Map value to color palette index
    const paletteIndex = Math.floor(value * this.colorPalette.length) % this.colorPalette.length;
    return this.colorPalette[paletteIndex];
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render plasma effect pixel by pixel
    // Use larger pixel size for performance
    const pixelSize = 2;

    for (let y = 0; y < this.height; y += pixelSize) {
      for (let x = 0; x < this.width; x += pixelSize) {
        const plasmaValue = this.calculatePlasmaValue(x, y);
        const color = this.getColorForValue(plasmaValue);

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }

    // Add some sparkle effects
    this.addSparkles();
  }

  addSparkles() {
    // Add random bright spots that appear and disappear
    for (let i = 0; i < 8; i++) {
      if (Math.random() < 0.3) {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        const intensity = Math.random();

        if (intensity > 0.7) {
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.fillRect(x, y, 1, 1);
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

// Initialize global plasma effect
window.plasmaEffect = new PlasmaEffect();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.plasmaEffect) {
    window.plasmaEffect.destroy();
  }
});