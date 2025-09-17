class WeatherRadar {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Radar configuration
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.maxRadius = Math.min(this.width, this.height) / 2 - 2;

    // Sweep parameters
    this.sweepAngle = 0;
    this.sweepSpeed = 0.05;

    // Weather data simulation
    this.weatherCells = [];
    this.maxCells = 15;
    this.time = 0;

    // Radar colors (LED optimized)
    this.radarColors = {
      background: '#000020',
      grid: '#004400',
      sweep: '#00FF00',
      sweepTrail: '#008800',
      light: '#00FF80',
      moderate: '#FFFF00',
      heavy: '#FF8000',
      severe: '#FF0000'
    };

    // Range rings
    this.ranges = [10, 20, 30]; // km ranges for display

    this.lastTime = 0;
    this.frameRate = 13; // ~75fps (1000ms / 75fps ≈ 13ms)
  }

  init() {
    this.canvas = document.getElementById('radar-canvas');
    if (!this.canvas) {
      console.error('Weather radar canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Initialize weather cells
    this.generateWeatherCells();

    // Start animation
    this.animate();
    console.log('Weather Radar initialized');
  }

  generateWeatherCells() {
    this.weatherCells = [];

    for (let i = 0; i < this.maxCells; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (this.maxRadius - 10) + 5;
      const intensity = Math.random();

      this.weatherCells.push({
        x: this.centerX + Math.cos(angle) * distance,
        y: this.centerY + Math.sin(angle) * distance,
        intensity: intensity,
        size: 3 + intensity * 5,
        movement: {
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3
        },
        age: 0,
        maxAge: 300 + Math.random() * 200
      });
    }
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
    this.time += 0.02;

    // Update sweep angle
    this.sweepAngle += this.sweepSpeed;
    if (this.sweepAngle >= Math.PI * 2) {
      this.sweepAngle = 0;
    }

    // Update weather cells
    this.weatherCells.forEach((cell, index) => {
      // Move cells
      cell.x += cell.movement.dx;
      cell.y += cell.movement.dy;

      // Age cells
      cell.age++;

      // Vary intensity over time
      cell.intensity += (Math.random() - 0.5) * 0.05;
      cell.intensity = Math.max(0, Math.min(1, cell.intensity));

      // Remove old cells
      if (cell.age > cell.maxAge) {
        this.weatherCells.splice(index, 1);
      }

      // Keep cells within radar range
      const distance = Math.sqrt(
        Math.pow(cell.x - this.centerX, 2) +
        Math.pow(cell.y - this.centerY, 2)
      );

      if (distance > this.maxRadius) {
        // Reset cell position
        const newAngle = Math.random() * Math.PI * 2;
        const newDistance = Math.random() * (this.maxRadius - 10) + 5;
        cell.x = this.centerX + Math.cos(newAngle) * newDistance;
        cell.y = this.centerY + Math.sin(newAngle) * newDistance;
      }
    });

    // Add new weather cells occasionally
    if (this.weatherCells.length < this.maxCells && Math.random() < 0.02) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (this.maxRadius - 10) + 5;
      const intensity = Math.random();

      this.weatherCells.push({
        x: this.centerX + Math.cos(angle) * distance,
        y: this.centerY + Math.sin(angle) * distance,
        intensity: intensity,
        size: 3 + intensity * 5,
        movement: {
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3
        },
        age: 0,
        maxAge: 300 + Math.random() * 200
      });
    }
  }

  render() {
    // Clear with radar background
    this.ctx.fillStyle = this.radarColors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw range rings
    this.drawRangeRings();

    // Draw cardinal directions
    this.drawCardinalDirections();

    // Draw weather cells
    this.drawWeatherCells();

    // Draw radar sweep
    this.drawRadarSweep();

    // Draw radar info
    this.drawRadarInfo();
  }

  drawRangeRings() {
    this.ctx.strokeStyle = this.radarColors.grid;
    this.ctx.lineWidth = 1;

    // Draw concentric circles
    for (let i = 1; i <= 3; i++) {
      const radius = (this.maxRadius / 3) * i;
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw crosshairs
    this.ctx.beginPath();
    // Vertical line
    this.ctx.moveTo(this.centerX, this.centerY - this.maxRadius);
    this.ctx.lineTo(this.centerX, this.centerY + this.maxRadius);
    // Horizontal line
    this.ctx.moveTo(this.centerX - this.maxRadius, this.centerY);
    this.ctx.lineTo(this.centerX + this.maxRadius, this.centerY);
    this.ctx.stroke();
  }

  drawCardinalDirections() {
    this.ctx.fillStyle = this.radarColors.grid;
    this.ctx.font = '8px monospace';
    this.ctx.textAlign = 'center';

    // North
    this.ctx.fillText('N', this.centerX, this.centerY - this.maxRadius - 8);
    // South
    this.ctx.fillText('S', this.centerX, this.centerY + this.maxRadius + 12);
    // East
    this.ctx.textAlign = 'left';
    this.ctx.fillText('E', this.centerX + this.maxRadius + 3, this.centerY + 3);
    // West
    this.ctx.textAlign = 'right';
    this.ctx.fillText('W', this.centerX - this.maxRadius - 3, this.centerY + 3);
  }

  drawWeatherCells() {
    this.weatherCells.forEach(cell => {
      let color;
      if (cell.intensity < 0.25) {
        color = this.radarColors.light;
      } else if (cell.intensity < 0.5) {
        color = this.radarColors.moderate;
      } else if (cell.intensity < 0.75) {
        color = this.radarColors.heavy;
      } else {
        color = this.radarColors.severe;
      }

      // Draw weather cell with fade based on age
      const ageFactor = 1 - (cell.age / cell.maxAge);
      const alpha = ageFactor * cell.intensity;

      // Convert hex color to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

      // Draw cell
      const size = Math.max(1, cell.size * ageFactor);
      this.ctx.fillRect(
        Math.floor(cell.x - size/2),
        Math.floor(cell.y - size/2),
        Math.ceil(size),
        Math.ceil(size)
      );
    });
  }

  drawRadarSweep() {
    // Draw sweep line
    const sweepEndX = this.centerX + Math.cos(this.sweepAngle - Math.PI/2) * this.maxRadius;
    const sweepEndY = this.centerY + Math.sin(this.sweepAngle - Math.PI/2) * this.maxRadius;

    this.ctx.strokeStyle = this.radarColors.sweep;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(sweepEndX, sweepEndY);
    this.ctx.stroke();

    // Draw sweep trail (fade effect)
    const trailLength = Math.PI / 3; // 60 degrees
    for (let i = 0; i < 20; i++) {
      const trailAngle = this.sweepAngle - (i * trailLength / 20);
      const trailAlpha = (20 - i) / 20 * 0.3;

      const trailEndX = this.centerX + Math.cos(trailAngle - Math.PI/2) * this.maxRadius;
      const trailEndY = this.centerY + Math.sin(trailAngle - Math.PI/2) * this.maxRadius;

      this.ctx.strokeStyle = `rgba(0, 136, 0, ${trailAlpha})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(trailEndX, trailEndY);
      this.ctx.stroke();
    }
  }

  drawRadarInfo() {
    // Draw radar information
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '6px monospace';
    this.ctx.textAlign = 'left';

    // Range info
    this.ctx.fillText('RADAR', 2, 8);
    this.ctx.fillText('30km', 2, 16);

    // Weather legend
    const legendY = this.height - 20;
    this.ctx.fillStyle = this.radarColors.light;
    this.ctx.fillRect(2, legendY, 8, 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText('LT', 12, legendY + 3);

    this.ctx.fillStyle = this.radarColors.heavy;
    this.ctx.fillRect(2, legendY + 5, 8, 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText('HV', 12, legendY + 8);

    // Timestamp
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(timeStr, this.width - 2, 8);
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

// Initialize global weather radar
window.weatherRadar = new WeatherRadar();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.weatherRadar) {
    window.weatherRadar.destroy();
  }
});