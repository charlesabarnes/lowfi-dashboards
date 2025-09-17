class Centipede {
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
    this.centipedes = [];
    this.mushrooms = [];
    this.spiders = [];
    this.flowers = [];

    this.initializeGame();
  }

  init() {
    this.canvas = document.getElementById('centipede-canvas');
    if (!this.canvas) {
      console.error('Centipede canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Centipede initialized with 75fps targeting');
  }

  initializeGame() {
    // Create mushrooms scattered around
    this.mushrooms = [];
    for (let i = 0; i < 15; i++) {
      this.mushrooms.push({
        x: Math.floor(Math.random() * (this.width / 4)) * 4,
        y: Math.floor(Math.random() * (this.height / 4)) * 4 + 16,
        size: 4,
        health: 3,
        color: '#8B4513'
      });
    }

    // Create flowers (bonus items)
    this.flowers = [];
    for (let i = 0; i < 8; i++) {
      this.flowers.push({
        x: Math.floor(Math.random() * (this.width / 4)) * 4,
        y: Math.floor(Math.random() * (this.height / 4)) * 4 + 20,
        size: 3,
        color: Math.random() < 0.5 ? '#FF69B4' : '#FFD700',
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 0.1
      });
    }

    // Create main centipede
    this.centipedes = [];
    this.createCentipede(12);

    // Create spiders
    this.spiders = [];
    for (let i = 0; i < 2; i++) {
      this.spiders.push({
        x: Math.random() * this.width,
        y: this.height - 20 + Math.random() * 15,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 0.5,
        size: 3,
        legs: [],
        legPhase: 0
      });

      // Initialize spider legs
      for (let j = 0; j < 8; j++) {
        this.spiders[i].legs.push({
          angle: (j / 8) * Math.PI * 2,
          length: 2 + Math.sin(j) * 1
        });
      }
    }
  }

  createCentipede(length) {
    const centipede = [];
    const startX = -length * 4;
    const startY = 8;

    for (let i = 0; i < length; i++) {
      centipede.push({
        x: startX + i * 4,
        y: startY,
        size: 4,
        isHead: i === 0,
        direction: 1, // 1 for right, -1 for left
        moveDown: false,
        color: i === 0 ? '#00FF00' : '#32CD32'
      });
    }

    this.centipedes.push(centipede);
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
    // Update centipedes
    for (let centipedeIndex = 0; centipedeIndex < this.centipedes.length; centipedeIndex++) {
      const centipede = this.centipedes[centipedeIndex];

      for (let i = 0; i < centipede.length; i++) {
        const segment = centipede[i];

        if (segment.isHead) {
          // Move head
          if (segment.moveDown) {
            segment.y += 4;
            segment.moveDown = false;
            segment.direction *= -1; // Change direction after moving down
          } else {
            segment.x += segment.direction * 1;
          }

          // Check wall collision
          if (segment.x <= 0 || segment.x >= this.width - segment.size) {
            segment.moveDown = true;
          }

          // Check mushroom collision
          for (let mushroom of this.mushrooms) {
            if (Math.abs(segment.x - mushroom.x) < 4 && Math.abs(segment.y - mushroom.y) < 4) {
              segment.moveDown = true;
              break;
            }
          }

          // Wrap around bottom
          if (segment.y > this.height) {
            segment.y = 0;
            segment.x = Math.random() * (this.width - segment.size);
          }
        } else {
          // Body segments follow the segment in front
          const prevSegment = centipede[i - 1];
          const dx = prevSegment.x - segment.x;
          const dy = prevSegment.y - segment.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 6) {
            segment.x += (dx / distance) * 1.5;
            segment.y += (dy / distance) * 1.5;
          }
        }
      }
    }

    // Update spiders
    this.spiders.forEach(spider => {
      spider.x += spider.vx;
      spider.y += spider.vy;

      // Bounce off walls
      if (spider.x <= 0 || spider.x >= this.width - spider.size) {
        spider.vx *= -1;
      }

      // Keep in bottom area
      if (spider.y <= this.height - 25 || spider.y >= this.height - 5) {
        spider.vy *= -1;
      }

      // Update leg animation
      spider.legPhase += 0.2;
    });

    // Update flowers (bobbing animation)
    this.flowers.forEach(flower => {
      flower.bobOffset += flower.bobSpeed;
    });

    // Create new centipede occasionally
    if (Math.random() < 0.002 && this.centipedes.length < 3) {
      this.createCentipede(8 + Math.floor(Math.random() * 6));
    }
  }

  render() {
    // Clear canvas with dark background
    this.ctx.fillStyle = '#001100';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw mushrooms
    this.mushrooms.forEach(mushroom => {
      // Mushroom cap
      this.ctx.fillStyle = mushroom.color;
      this.ctx.fillRect(mushroom.x, mushroom.y, mushroom.size, mushroom.size - 1);

      // Mushroom stem
      this.ctx.fillStyle = '#654321';
      this.ctx.fillRect(mushroom.x + 1, mushroom.y + mushroom.size - 1, mushroom.size - 2, 2);

      // Mushroom spots
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(mushroom.x + 1, mushroom.y + 1, 1, 1);
      this.ctx.fillRect(mushroom.x + 3, mushroom.y + 2, 1, 1);
    });

    // Draw flowers
    this.flowers.forEach(flower => {
      const bobY = flower.y + Math.sin(flower.bobOffset) * 1;

      this.ctx.fillStyle = flower.color;
      // Flower petals
      this.ctx.fillRect(flower.x, bobY, flower.size, 1);
      this.ctx.fillRect(flower.x, bobY + 2, flower.size, 1);
      this.ctx.fillRect(flower.x + 1, bobY - 1, 1, flower.size + 2);

      // Flower center
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.fillRect(flower.x + 1, bobY + 1, 1, 1);
    });

    // Draw centipedes
    this.centipedes.forEach(centipede => {
      centipede.forEach((segment, index) => {
        this.ctx.fillStyle = segment.color;
        this.ctx.fillRect(Math.floor(segment.x), Math.floor(segment.y), segment.size, segment.size);

        if (segment.isHead) {
          // Draw eyes
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.fillRect(Math.floor(segment.x) + 1, Math.floor(segment.y) + 1, 1, 1);
          this.ctx.fillRect(Math.floor(segment.x) + 3, Math.floor(segment.y) + 1, 1, 1);

          // Draw antennae
          this.ctx.fillStyle = '#FFFF00';
          this.ctx.fillRect(Math.floor(segment.x), Math.floor(segment.y) - 1, 1, 1);
          this.ctx.fillRect(Math.floor(segment.x) + 3, Math.floor(segment.y) - 1, 1, 1);
        } else {
          // Body segments get slightly different shading
          this.ctx.fillStyle = '#228B22';
          this.ctx.fillRect(Math.floor(segment.x) + 1, Math.floor(segment.y) + 1, segment.size - 2, segment.size - 2);
        }
      });
    });

    // Draw spiders
    this.spiders.forEach(spider => {
      // Spider body
      this.ctx.fillStyle = '#FF4500';
      this.ctx.fillRect(Math.floor(spider.x), Math.floor(spider.y), spider.size, spider.size);

      // Spider legs
      this.ctx.fillStyle = '#8B0000';
      spider.legs.forEach((leg, index) => {
        const legX = spider.x + spider.size/2 + Math.cos(leg.angle + spider.legPhase) * leg.length;
        const legY = spider.y + spider.size/2 + Math.sin(leg.angle + spider.legPhase) * leg.length * 0.5;

        if (legX >= 0 && legX < this.width && legY >= 0 && legY < this.height) {
          this.ctx.fillRect(Math.floor(legX), Math.floor(legY), 1, 1);
        }
      });
    });

    // Draw border at bottom (player area)
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(0, this.height - 20, this.width, 1);
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
    this.centipedes = [];
    this.mushrooms = [];
    this.spiders = [];
    this.flowers = [];
  }
}

// Create global instance
window.centipede = new Centipede();