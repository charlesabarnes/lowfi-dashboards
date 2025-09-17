class Frogger {
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

    // Game elements
    this.frogs = [];
    this.cars = [];
    this.logs = [];
    this.turtles = [];
    this.lilypads = [];

    this.initializeGame();
  }

  init() {
    this.canvas = document.getElementById('frogger-canvas');
    if (!this.canvas) {
      console.error('Frogger canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Frogger initialized with 75fps targeting');
  }

  initializeGame() {
    // Create frogs
    this.frogs = [];
    for (let i = 0; i < 3; i++) {
      this.frogs.push({
        x: 10 + i * 30,
        y: 60,
        targetY: 5,
        hopTimer: 0,
        hopDuration: 30,
        color: '#00FF00',
        isHopping: false,
        onLog: false
      });
    }

    // Create cars (road obstacles)
    this.cars = [];
    for (let lane = 0; lane < 3; lane++) {
      for (let i = 0; i < 4; i++) {
        this.cars.push({
          x: i * 40 - 20,
          y: 40 - lane * 8,
          width: 12,
          height: 6,
          speed: (lane % 2 === 0 ? 1.5 : -1.2) * (Math.random() * 0.5 + 0.8),
          color: ['#FF0000', '#0000FF', '#FFFF00', '#FF00FF'][i % 4],
          lane: lane
        });
      }
    }

    // Create logs (water helpers)
    this.logs = [];
    for (let lane = 0; lane < 2; lane++) {
      for (let i = 0; i < 3; i++) {
        this.logs.push({
          x: i * 50 - 10,
          y: 25 - lane * 12,
          width: 20,
          height: 6,
          speed: lane % 2 === 0 ? 0.8 : -0.6,
          color: '#8B4513',
          lane: lane
        });
      }
    }

    // Create turtles
    this.turtles = [];
    for (let i = 0; i < 6; i++) {
      this.turtles.push({
        x: i * 25,
        y: 15,
        size: 4,
        speed: -0.4,
        bobOffset: i * Math.PI / 3,
        color: '#228B22',
        submerged: false,
        submergeTimer: 0
      });
    }

    // Create lily pads (goals)
    this.lilypads = [];
    for (let i = 0; i < 5; i++) {
      this.lilypads.push({
        x: i * 25 + 5,
        y: 2,
        size: 6,
        occupied: false,
        color: '#32CD32'
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

    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    // Update frogs
    this.frogs.forEach(frog => {
      if (!frog.isHopping && Math.random() < 0.01) {
        frog.isHopping = true;
        frog.hopTimer = 0;
      }

      if (frog.isHopping) {
        frog.hopTimer++;

        // Move towards target
        const progress = frog.hopTimer / frog.hopDuration;
        if (progress >= 1) {
          frog.y = frog.targetY;
          frog.isHopping = false;

          // Set new target
          if (frog.y > 30) {
            frog.targetY = Math.max(5, frog.y - 8);
          } else {
            frog.targetY = 60; // Go back to start
          }
        } else {
          // Smooth hopping motion
          const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
          frog.y = frog.y + (frog.targetY - frog.y) * easedProgress * 0.1;
        }
      }

      // Check if frog is on a log
      frog.onLog = false;
      if (frog.y < 30 && frog.y > 10) {
        for (let log of this.logs) {
          if (frog.x >= log.x && frog.x <= log.x + log.width &&
              Math.abs(frog.y - log.y) < 6) {
            frog.onLog = true;
            frog.x += log.speed; // Move with log
            break;
          }
        }

        // Check turtles
        for (let turtle of this.turtles) {
          if (!turtle.submerged &&
              Math.abs(frog.x - turtle.x) < 4 &&
              Math.abs(frog.y - turtle.y) < 4) {
            frog.onLog = true;
            frog.x += turtle.speed; // Move with turtle
            break;
          }
        }
      }

      // Keep frogs on screen
      frog.x = Math.max(2, Math.min(this.width - 4, frog.x));

      // Check if reached lily pad
      for (let pad of this.lilypads) {
        if (Math.abs(frog.x - pad.x) < 6 && Math.abs(frog.y - pad.y) < 4) {
          pad.occupied = true;
          // Reset frog
          frog.x = 10 + Math.random() * 50;
          frog.y = 60;
          frog.targetY = 5;
        }
      }
    });

    // Update cars
    this.cars.forEach(car => {
      car.x += car.speed;

      // Wrap around
      if (car.speed > 0 && car.x > this.width + 10) {
        car.x = -car.width - 10;
      } else if (car.speed < 0 && car.x < -car.width - 10) {
        car.x = this.width + 10;
      }
    });

    // Update logs
    this.logs.forEach(log => {
      log.x += log.speed;

      // Wrap around
      if (log.speed > 0 && log.x > this.width + 10) {
        log.x = -log.width - 10;
      } else if (log.speed < 0 && log.x < -log.width - 10) {
        log.x = this.width + 10;
      }
    });

    // Update turtles
    this.turtles.forEach(turtle => {
      turtle.x += turtle.speed;
      turtle.bobOffset += 0.1;

      // Submersion cycle
      turtle.submergeTimer++;
      if (turtle.submergeTimer > 200) {
        turtle.submerged = !turtle.submerged;
        turtle.submergeTimer = 0;
      }

      // Wrap around
      if (turtle.x < -10) {
        turtle.x = this.width + 10;
      }
    });
  }

  render() {
    // Background sections
    // Water (top)
    this.ctx.fillStyle = '#0066CC';
    this.ctx.fillRect(0, 0, this.width, 35);

    // Road (middle)
    this.ctx.fillStyle = '#444444';
    this.ctx.fillRect(0, 35, this.width, 25);

    // Grass (bottom)
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(0, 60, this.width, 4);

    // Road stripes
    this.ctx.fillStyle = '#FFFF00';
    for (let y = 39; y < 60; y += 8) {
      for (let x = 0; x < this.width; x += 8) {
        this.ctx.fillRect(x, y, 4, 1);
      }
    }

    // Draw lily pads
    this.lilypads.forEach(pad => {
      this.ctx.fillStyle = pad.occupied ? '#90EE90' : pad.color;
      this.ctx.fillRect(pad.x, pad.y, pad.size, pad.size);

      // Lily pad details
      this.ctx.fillStyle = '#006400';
      this.ctx.fillRect(pad.x + 1, pad.y + 1, pad.size - 2, 1);
      this.ctx.fillRect(pad.x + pad.size/2, pad.y, 1, pad.size);
    });

    // Draw logs
    this.logs.forEach(log => {
      this.ctx.fillStyle = log.color;
      this.ctx.fillRect(log.x, log.y, log.width, log.height);

      // Log texture
      this.ctx.fillStyle = '#654321';
      for (let i = 0; i < log.width; i += 4) {
        this.ctx.fillRect(log.x + i, log.y + 1, 1, 1);
        this.ctx.fillRect(log.x + i + 2, log.y + 4, 1, 1);
      }
    });

    // Draw turtles
    this.turtles.forEach(turtle => {
      if (!turtle.submerged) {
        const bobY = turtle.y + Math.sin(turtle.bobOffset) * 1;

        this.ctx.fillStyle = turtle.color;
        this.ctx.fillRect(turtle.x, bobY, turtle.size, turtle.size);

        // Turtle shell pattern
        this.ctx.fillStyle = '#006400';
        this.ctx.fillRect(turtle.x + 1, bobY + 1, turtle.size - 2, turtle.size - 2);

        // Eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(turtle.x, bobY - 1, 1, 1);
        this.ctx.fillRect(turtle.x + turtle.size - 1, bobY - 1, 1, 1);
      }
    });

    // Draw cars
    this.cars.forEach(car => {
      this.ctx.fillStyle = car.color;
      this.ctx.fillRect(car.x, car.y, car.width, car.height);

      // Car details
      this.ctx.fillStyle = '#FFFFFF';
      // Windows
      this.ctx.fillRect(car.x + 2, car.y + 1, car.width - 4, 2);
      // Headlights
      if (car.speed > 0) {
        this.ctx.fillRect(car.x + car.width - 1, car.y + 1, 1, 2);
        this.ctx.fillRect(car.x + car.width - 1, car.y + car.height - 3, 1, 2);
      } else {
        this.ctx.fillRect(car.x, car.y + 1, 1, 2);
        this.ctx.fillRect(car.x, car.y + car.height - 3, 1, 2);
      }
    });

    // Draw frogs
    this.frogs.forEach(frog => {
      this.ctx.fillStyle = frog.color;
      this.ctx.fillRect(frog.x, frog.y, 4, 4);

      // Frog eyes
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(frog.x, frog.y, 1, 1);
      this.ctx.fillRect(frog.x + 3, frog.y, 1, 1);

      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(frog.x, frog.y, 1, 1);
      this.ctx.fillRect(frog.x + 3, frog.y, 1, 1);
    });
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
    this.frogs = [];
    this.cars = [];
    this.logs = [];
    this.turtles = [];
    this.lilypads = [];
  }
}

// Create global instance
window.frogger = new Frogger();