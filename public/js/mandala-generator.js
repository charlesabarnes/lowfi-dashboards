class MandalaGenerator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Mandala configuration
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.time = 0;
    this.radius = Math.min(this.width, this.height) / 3;

    // Animation parameters
    this.rotationSpeed = 0.02;
    this.petals = 8;
    this.layers = 3;
    this.colorIndex = 0;

    // LED-optimized colors
    this.colors = [
      '#FF0000', // Red
      '#00FF00', // Green
      '#0000FF', // Blue
      '#FFFF00', // Yellow
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#FF8000', // Orange
      '#8000FF'  // Purple
    ];

    this.lastTime = 0;
    this.frameRate = 13; // ~75fps (1000ms / 75fps ≈ 13ms)
  }

  init() {
    this.canvas = document.getElementById('mandala-canvas');
    if (!this.canvas) {
      console.error('Mandala canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Mandala Generator initialized');
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
    this.time += this.rotationSpeed;

    // Slowly change color every few seconds
    if (Math.floor(this.time * 10) % 100 === 0) {
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    }

    // Vary petal count over time
    this.petals = 6 + Math.floor(3 * Math.sin(this.time * 0.1));
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw multiple layers of the mandala
    for (let layer = 0; layer < this.layers; layer++) {
      const layerRadius = this.radius * (0.4 + layer * 0.3);
      const layerTime = this.time + layer * Math.PI / 4;
      const colorIdx = (this.colorIndex + layer) % this.colors.length;

      this.drawMandalaLayer(layerRadius, layerTime, this.colors[colorIdx], layer);
    }
  }

  drawMandalaLayer(radius, time, color, layer) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    // Draw petals
    for (let i = 0; i < this.petals; i++) {
      const angle = (i / this.petals) * Math.PI * 2 + time;

      // Calculate petal positions
      const petalRadius = radius * (0.7 + 0.3 * Math.sin(time * 2 + i));
      const x1 = this.centerX + Math.cos(angle) * petalRadius;
      const y1 = this.centerY + Math.sin(angle) * petalRadius;

      // Draw lines from center to petal points
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(Math.floor(x1), Math.floor(y1));
      this.ctx.stroke();

      // Draw connecting lines between adjacent petals
      const nextAngle = ((i + 1) / this.petals) * Math.PI * 2 + time;
      const nextRadius = radius * (0.7 + 0.3 * Math.sin(time * 2 + (i + 1)));
      const x2 = this.centerX + Math.cos(nextAngle) * nextRadius;
      const y2 = this.centerY + Math.sin(nextAngle) * nextRadius;

      this.ctx.beginPath();
      this.ctx.moveTo(Math.floor(x1), Math.floor(y1));
      this.ctx.lineTo(Math.floor(x2), Math.floor(y2));
      this.ctx.stroke();

      // Draw small circles at petal points
      if (layer === 0) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x1) - 1, Math.floor(y1) - 1, 2, 2);
      }
    }

    // Draw center circle
    if (layer === 0) {
      this.ctx.fillStyle = color;
      const centerSize = 2 + Math.floor(2 * Math.sin(time * 3));
      this.ctx.fillRect(
        Math.floor(this.centerX - centerSize/2),
        Math.floor(this.centerY - centerSize/2),
        centerSize,
        centerSize
      );
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

// Initialize global mandala generator
window.mandalaGenerator = new MandalaGenerator();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.mandalaGenerator) {
    window.mandalaGenerator.destroy();
  }
});