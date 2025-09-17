class ClockTower {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Clock configuration
    this.clockX = this.width / 2;
    this.clockY = this.height / 2 - 5;
    this.clockRadius = 20;

    // Tower configuration
    this.towerWidth = 16;
    this.towerHeight = 40;
    this.towerX = this.clockX - this.towerWidth / 2;
    this.towerY = this.height - this.towerHeight;

    // Animation state
    this.time = 0;
    this.secondTick = 0;
    this.pendulumAngle = 0;
    this.pendulumSpeed = 0.15;
    this.gearRotation = 0;

    // Colors
    this.towerColor = '#808080';
    this.clockFaceColor = '#FFFFFF';
    this.handsColor = '#000000';
    this.numberColor = '#000000';
    this.pendulumColor = '#FFAA00';
    this.gearColor = '#CCCCCC';

    this.lastTime = 0;
    this.frameRate = 13; // ~75fps (1000ms / 75fps ≈ 13ms)
  }

  init() {
    this.canvas = document.getElementById('clock-canvas');
    if (!this.canvas) {
      console.error('Clock tower canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Clock Tower initialized');
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
    this.time += 0.05;

    // Update pendulum animation
    this.pendulumAngle = Math.sin(this.time * this.pendulumSpeed) * 0.3;

    // Update gear rotation
    this.gearRotation += 0.1;

    // Update second tick for realistic clock movement
    this.secondTick += 0.02;
  }

  getCurrentTime() {
    const now = new Date();
    return {
      hours: now.getHours() % 12,
      minutes: now.getMinutes(),
      seconds: now.getSeconds()
    };
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000040'; // Dark blue background
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw stars in background
    this.drawStars();

    // Draw the tower structure
    this.drawTower();

    // Draw the clock face
    this.drawClockFace();

    // Draw clock hands
    this.drawClockHands();

    // Draw pendulum
    this.drawPendulum();

    // Draw decorative gears
    this.drawGears();

    // Draw tower details
    this.drawTowerDetails();
  }

  drawStars() {
    // Draw a few twinkling stars
    const stars = [
      {x: 20, y: 15}, {x: 45, y: 8}, {x: 80, y: 12},
      {x: 100, y: 20}, {x: 15, y: 25}, {x: 110, y: 35}
    ];

    stars.forEach((star, index) => {
      const twinkle = Math.sin(this.time * 2 + index) * 0.5 + 0.5;
      if (twinkle > 0.3) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(star.x, star.y, 1, 1);
      }
    });
  }

  drawTower() {
    // Main tower body
    this.ctx.fillStyle = this.towerColor;
    this.ctx.fillRect(this.towerX, this.towerY, this.towerWidth, this.towerHeight);

    // Tower outline
    this.ctx.strokeStyle = '#AAAAAA';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.towerX, this.towerY, this.towerWidth, this.towerHeight);

    // Tower roof
    this.ctx.fillStyle = '#AA4444';
    this.ctx.beginPath();
    this.ctx.moveTo(this.towerX - 2, this.towerY);
    this.ctx.lineTo(this.clockX, this.towerY - 8);
    this.ctx.lineTo(this.towerX + this.towerWidth + 2, this.towerY);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawTowerDetails() {
    // Windows
    this.ctx.fillStyle = '#FFFF80';

    // Window 1
    this.ctx.fillRect(this.towerX + 3, this.towerY + 25, 3, 4);
    this.ctx.fillRect(this.towerX + 10, this.towerY + 25, 3, 4);

    // Window 2 (higher up)
    this.ctx.fillRect(this.towerX + 3, this.towerY + 15, 3, 4);
    this.ctx.fillRect(this.towerX + 10, this.towerY + 15, 3, 4);

    // Door at the base
    this.ctx.fillStyle = '#444444';
    this.ctx.fillRect(this.towerX + 6, this.towerY + 35, 4, 5);

    // Door handle
    this.ctx.fillStyle = '#FFAA00';
    this.ctx.fillRect(this.towerX + 9, this.towerY + 37, 1, 1);
  }

  drawClockFace() {
    // Clock face background (white circle)
    this.ctx.fillStyle = this.clockFaceColor;
    this.ctx.beginPath();
    this.ctx.arc(this.clockX, this.clockY, this.clockRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Clock face border
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.clockX, this.clockY, this.clockRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x1 = this.clockX + Math.cos(angle) * (this.clockRadius - 3);
      const y1 = this.clockY + Math.sin(angle) * (this.clockRadius - 3);
      const x2 = this.clockX + Math.cos(angle) * (this.clockRadius - 1);
      const y2 = this.clockY + Math.sin(angle) * (this.clockRadius - 1);

      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = i % 3 === 0 ? 2 : 1; // Thicker lines for 12, 3, 6, 9
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    // Center dot
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(this.clockX, this.clockY, 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawClockHands() {
    const time = this.getCurrentTime();

    // Calculate angles (12 o'clock is at -90 degrees)
    const hourAngle = ((time.hours + time.minutes / 60) * 30 - 90) * (Math.PI / 180);
    const minuteAngle = ((time.minutes + time.seconds / 60) * 6 - 90) * (Math.PI / 180);
    const secondAngle = (time.seconds * 6 - 90) * (Math.PI / 180);

    // Hour hand
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.clockX, this.clockY);
    this.ctx.lineTo(
      this.clockX + Math.cos(hourAngle) * (this.clockRadius * 0.5),
      this.clockY + Math.sin(hourAngle) * (this.clockRadius * 0.5)
    );
    this.ctx.stroke();

    // Minute hand
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.clockX, this.clockY);
    this.ctx.lineTo(
      this.clockX + Math.cos(minuteAngle) * (this.clockRadius * 0.8),
      this.clockY + Math.sin(minuteAngle) * (this.clockRadius * 0.8)
    );
    this.ctx.stroke();

    // Second hand (red)
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.clockX, this.clockY);
    this.ctx.lineTo(
      this.clockX + Math.cos(secondAngle) * (this.clockRadius * 0.9),
      this.clockY + Math.sin(secondAngle) * (this.clockRadius * 0.9)
    );
    this.ctx.stroke();
  }

  drawPendulum() {
    // Pendulum rod
    const pendulumX = this.clockX;
    const pendulumY = this.clockY + this.clockRadius + 5;
    const pendulumLength = 15;

    const pendulumEndX = pendulumX + Math.sin(this.pendulumAngle) * pendulumLength;
    const pendulumEndY = pendulumY + Math.cos(this.pendulumAngle) * pendulumLength;

    this.ctx.strokeStyle = '#444444';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(pendulumX, pendulumY);
    this.ctx.lineTo(pendulumEndX, pendulumEndY);
    this.ctx.stroke();

    // Pendulum weight
    this.ctx.fillStyle = this.pendulumColor;
    this.ctx.beginPath();
    this.ctx.arc(pendulumEndX, pendulumEndY, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Pendulum attachment point
    this.ctx.fillStyle = '#666666';
    this.ctx.beginPath();
    this.ctx.arc(pendulumX, pendulumY, 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawGears() {
    // Small decorative gear on the side
    const gearX = this.towerX + this.towerWidth + 8;
    const gearY = this.clockY;
    const gearRadius = 6;
    const teeth = 8;

    this.ctx.strokeStyle = this.gearColor;
    this.ctx.fillStyle = this.gearColor;
    this.ctx.lineWidth = 1;

    // Draw gear teeth
    this.ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const angle = (i * (360 / teeth) + this.gearRotation) * (Math.PI / 180);
      const x = gearX + Math.cos(angle) * gearRadius;
      const y = gearY + Math.sin(angle) * gearRadius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Gear center
    this.ctx.fillStyle = '#888888';
    this.ctx.beginPath();
    this.ctx.arc(gearX, gearY, 3, 0, Math.PI * 2);
    this.ctx.fill();
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

// Initialize global clock tower
window.clockTower = new ClockTower();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.clockTower) {
    window.clockTower.destroy();
  }
});