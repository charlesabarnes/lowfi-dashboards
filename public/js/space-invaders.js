class SpaceInvaders {
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

    // Stars for background
    this.stars = [];
    this.aliens = [];
    this.bullets = [];
    this.explosions = [];

    // Initialize elements
    this.initializeStars();
    this.initializeAliens();
  }

  init() {
    this.canvas = document.getElementById('space-invaders-canvas');
    if (!this.canvas) {
      console.error('Space Invaders canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Space Invaders initialized with 75fps targeting');
  }

  initializeStars() {
    // Create starfield background
    this.stars = [];
    for (let i = 0; i < 30; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  initializeAliens() {
    this.aliens = [];
    // Create 4 rows of aliens (11x4 = 44 aliens)
    const alienWidth = 8;
    const alienHeight = 6;
    const spacing = 10;
    const startX = 10;
    const startY = 5;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 11; col++) {
        this.aliens.push({
          x: startX + col * spacing,
          y: startY + row * 8,
          width: alienWidth,
          height: alienHeight,
          alive: true,
          type: row < 2 ? 'small' : 'medium', // Top 2 rows small, bottom 2 medium
          animFrame: Math.floor(Math.random() * 2),
          color: row === 0 ? '#FFFF00' : row === 1 ? '#00FF00' : row === 2 ? '#FF6600' : '#FF0066'
        });
      }
    }

    // Movement pattern
    this.alienDirection = 1;
    this.alienMoveTimer = 0;
    this.alienMoveInterval = 60; // frames between moves
    this.alienDropDistance = 4;
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
    // Update stars (twinkling)
    this.stars.forEach(star => {
      star.twinkle += 0.05;
      star.brightness = 0.3 + Math.sin(star.twinkle) * 0.4;
      if (star.brightness < 0) star.brightness = 0;
    });

    // Update alien movement
    this.alienMoveTimer++;
    if (this.alienMoveTimer >= this.alienMoveInterval) {
      this.moveAliens();
      this.alienMoveTimer = 0;

      // Speed up over time
      if (this.alienMoveInterval > 20) {
        this.alienMoveInterval -= 0.2;
      }
    }

    // Update alien animation frames
    if (Math.floor(this.time * 4) % 2 === 0) {
      this.aliens.forEach(alien => {
        if (alien.alive) {
          alien.animFrame = (alien.animFrame + 1) % 2;
        }
      });
    }

    // Random alien shooting
    if (Math.random() < 0.02) {
      this.alienShoot();
    }

    // Update bullets
    this.bullets.forEach((bullet, index) => {
      bullet.y += bullet.speedY;

      // Remove bullets that go off screen
      if (bullet.y < 0 || bullet.y > this.height) {
        this.bullets.splice(index, 1);
      }
    });

    // Update explosions
    this.explosions.forEach((explosion, index) => {
      explosion.life--;
      if (explosion.life <= 0) {
        this.explosions.splice(index, 1);
      }
    });

    // Check for collisions
    this.checkCollisions();
  }

  moveAliens() {
    let shouldDrop = false;

    // Check if any alien reaches the edge
    this.aliens.forEach(alien => {
      if (alien.alive) {
        if ((alien.x <= 2 && this.alienDirection === -1) ||
            (alien.x >= this.width - 10 && this.alienDirection === 1)) {
          shouldDrop = true;
        }
      }
    });

    if (shouldDrop) {
      // Drop down and reverse direction
      this.aliens.forEach(alien => {
        if (alien.alive) {
          alien.y += this.alienDropDistance;
        }
      });
      this.alienDirection *= -1;
    } else {
      // Move horizontally
      this.aliens.forEach(alien => {
        if (alien.alive) {
          alien.x += 2 * this.alienDirection;
        }
      });
    }
  }

  alienShoot() {
    // Find a random living alien from the bottom row
    const livingAliens = this.aliens.filter(alien => alien.alive);
    if (livingAliens.length === 0) return;

    const shooter = livingAliens[Math.floor(Math.random() * livingAliens.length)];

    this.bullets.push({
      x: shooter.x + shooter.width / 2,
      y: shooter.y + shooter.height,
      speedY: 1.5,
      color: '#FF0000',
      type: 'alien'
    });
  }

  checkCollisions() {
    // Simple collision detection for demo
    this.bullets.forEach((bullet, bulletIndex) => {
      this.aliens.forEach((alien, alienIndex) => {
        if (alien.alive && bullet.type === 'player' &&
            bullet.x >= alien.x && bullet.x <= alien.x + alien.width &&
            bullet.y >= alien.y && bullet.y <= alien.y + alien.height) {

          // Create explosion
          this.explosions.push({
            x: alien.x + alien.width / 2,
            y: alien.y + alien.height / 2,
            life: 10,
            color: alien.color
          });

          // Remove alien and bullet
          alien.alive = false;
          this.bullets.splice(bulletIndex, 1);
        }
      });
    });
  }

  render() {
    // Clear canvas with solid black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw stars
    this.drawStars();

    // Draw aliens
    this.drawAliens();

    // Draw bullets
    this.drawBullets();

    // Draw explosions
    this.drawExplosions();
  }

  drawStars() {
    this.stars.forEach(star => {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      this.ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    });
  }

  drawAliens() {
    this.aliens.forEach(alien => {
      if (!alien.alive) return;

      this.ctx.fillStyle = alien.color;

      // Draw alien based on type and animation frame
      if (alien.type === 'small') {
        this.drawSmallAlien(alien);
      } else {
        this.drawMediumAlien(alien);
      }
    });
  }

  drawSmallAlien(alien) {
    const x = Math.floor(alien.x);
    const y = Math.floor(alien.y);

    if (alien.animFrame === 0) {
      // Frame 1: arms down
      this.ctx.fillRect(x + 2, y, 4, 1);     // top
      this.ctx.fillRect(x + 1, y + 1, 6, 1); // head
      this.ctx.fillRect(x + 1, y + 2, 6, 1); // body top
      this.ctx.fillRect(x + 0, y + 3, 8, 1); // body wide
      this.ctx.fillRect(x + 2, y + 4, 4, 1); // body bottom
    } else {
      // Frame 2: arms up
      this.ctx.fillRect(x + 2, y, 4, 1);     // top
      this.ctx.fillRect(x + 1, y + 1, 6, 1); // head
      this.ctx.fillRect(x + 1, y + 2, 6, 1); // body top
      this.ctx.fillRect(x + 0, y + 3, 8, 1); // body wide
      this.ctx.fillRect(x + 1, y + 4, 6, 1); // body bottom
    }
  }

  drawMediumAlien(alien) {
    const x = Math.floor(alien.x);
    const y = Math.floor(alien.y);

    if (alien.animFrame === 0) {
      this.ctx.fillRect(x + 1, y, 6, 1);     // top
      this.ctx.fillRect(x + 0, y + 1, 8, 1); // head
      this.ctx.fillRect(x + 0, y + 2, 8, 1); // body top
      this.ctx.fillRect(x + 1, y + 3, 6, 1); // body
      this.ctx.fillRect(x + 2, y + 4, 4, 1); // body bottom
    } else {
      this.ctx.fillRect(x + 1, y, 6, 1);     // top
      this.ctx.fillRect(x + 0, y + 1, 8, 1); // head
      this.ctx.fillRect(x + 0, y + 2, 8, 1); // body top
      this.ctx.fillRect(x + 2, y + 3, 4, 1); // body
      this.ctx.fillRect(x + 1, y + 4, 6, 1); // body bottom
    }
  }

  drawBullets() {
    this.bullets.forEach(bullet => {
      this.ctx.fillStyle = bullet.color;
      this.ctx.fillRect(Math.floor(bullet.x - 1), Math.floor(bullet.y - 2), 2, 4);
    });
  }

  drawExplosions() {
    this.explosions.forEach(explosion => {
      const alpha = explosion.life / 10;
      this.ctx.fillStyle = explosion.color;
      this.ctx.globalAlpha = alpha;

      // Draw explosion particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = (10 - explosion.life) * 2;
        const px = explosion.x + Math.cos(angle) * distance;
        const py = explosion.y + Math.sin(angle) * distance;

        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
        }
      }

      this.ctx.globalAlpha = 1;
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
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

// Initialize global space invaders
window.spaceInvaders = new SpaceInvaders();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.spaceInvaders) {
    window.spaceInvaders.destroy();
  }
});