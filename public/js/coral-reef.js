class CoralReef {
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

    // Coral formations
    this.corals = [];
    this.maxCorals = 8;

    // Fish
    this.fish = [];
    this.maxFish = 12;

    // Bubbles
    this.bubbles = [];
    this.maxBubbles = 15;

    // Seaweed
    this.seaweed = [];
    this.maxSeaweed = 6;

    this.initializeReef();
  }

  init() {
    this.canvas = document.getElementById('coral-reef-canvas');
    if (!this.canvas) {
      console.error('Coral Reef canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Coral Reef initialized with 75fps targeting');
  }

  initializeReef() {
    // Create coral formations
    const coralColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    for (let i = 0; i < this.maxCorals; i++) {
      this.corals.push({
        x: 10 + Math.random() * 108,
        y: 45 + Math.random() * 15,
        width: 3 + Math.random() * 6,
        height: 4 + Math.random() * 8,
        color: coralColors[Math.floor(Math.random() * coralColors.length)],
        type: Math.floor(Math.random() * 3), // Different coral shapes
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.02
      });
    }

    // Create seaweed
    for (let i = 0; i < this.maxSeaweed; i++) {
      this.seaweed.push({
        x: 15 + Math.random() * 98,
        y: 50 + Math.random() * 10,
        height: 8 + Math.random() * 12,
        segments: 4 + Math.floor(Math.random() * 4),
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.03 + Math.random() * 0.02,
        color: '#228B22'
      });
    }

    // Create fish
    const fishColors = ['#FF4500', '#FFD700', '#00CED1', '#FF1493', '#32CD32', '#9370DB'];
    const fishTypes = ['tropical', 'angel', 'clown', 'tang'];

    for (let i = 0; i < this.maxFish; i++) {
      this.fish.push({
        x: Math.random() * this.width,
        y: 15 + Math.random() * 35,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 3,
        color: fishColors[Math.floor(Math.random() * fishColors.length)],
        type: fishTypes[Math.floor(Math.random() * fishTypes.length)],
        swimPhase: Math.random() * Math.PI * 2,
        swimSpeed: 0.05 + Math.random() * 0.05,
        direction: Math.random() < 0.5 ? 1 : -1,
        turnTimer: 0
      });
    }

    // Create bubbles
    for (let i = 0; i < this.maxBubbles; i++) {
      this.createBubble();
    }
  }

  createBubble() {
    this.bubbles.push({
      x: Math.random() * this.width,
      y: this.height + Math.random() * 20,
      vy: -0.3 - Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.2,
      size: 1 + Math.random() * 2,
      life: 0,
      maxLife: 200 + Math.random() * 100
    });
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
    // Update coral swaying
    this.corals.forEach(coral => {
      coral.swayPhase += coral.swaySpeed;
    });

    // Update seaweed swaying
    this.seaweed.forEach(seaweed => {
      seaweed.swayPhase += seaweed.swaySpeed;
    });

    // Update fish
    this.fish.forEach(fish => {
      // Swimming animation
      fish.swimPhase += fish.swimSpeed;

      // Add slight vertical bobbing
      fish.vy += Math.sin(fish.swimPhase) * 0.002;

      // Occasional direction changes
      fish.turnTimer++;
      if (fish.turnTimer > 120 + Math.random() * 180) {
        fish.direction *= -1;
        fish.turnTimer = 0;
      }

      // Move fish
      fish.x += fish.vx * fish.direction;
      fish.y += fish.vy;

      // Apply some drag
      fish.vy *= 0.98;

      // Wrap around screen
      if (fish.x < -fish.size) fish.x = this.width + fish.size;
      if (fish.x > this.width + fish.size) fish.x = -fish.size;

      // Keep fish in water bounds
      if (fish.y < 8) {
        fish.y = 8;
        fish.vy = Math.abs(fish.vy);
      }
      if (fish.y > 50) {
        fish.y = 50;
        fish.vy = -Math.abs(fish.vy);
      }
    });

    // Update bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];

      bubble.x += bubble.vx;
      bubble.y += bubble.vy;
      bubble.life++;

      // Add some sway to bubbles
      bubble.x += Math.sin(bubble.life * 0.1) * 0.1;

      // Remove bubbles that reach surface or expire
      if (bubble.y < -bubble.size || bubble.life > bubble.maxLife) {
        this.bubbles.splice(i, 1);
        this.createBubble();
      }
    }
  }

  render() {
    // Clear canvas with deep ocean blue
    this.ctx.fillStyle = '#003366';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ocean gradient
    for (let y = 0; y < this.height; y++) {
      const depth = y / this.height;
      const r = Math.floor(0 * (1 - depth) + 51 * depth);
      const g = Math.floor(51 * (1 - depth) + 102 * depth);
      const b = Math.floor(102 * (1 - depth) + 204 * depth);

      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.fillRect(0, y, this.width, 1);
    }

    // Draw sandy bottom
    this.ctx.fillStyle = '#F4A460';
    this.ctx.fillRect(0, 55, this.width, this.height - 55);

    // Add some sand texture
    this.ctx.fillStyle = '#DEB887';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.width;
      const y = 55 + Math.random() * 8;
      this.ctx.fillRect(Math.floor(x), Math.floor(y), 2, 1);
    }

    // Draw seaweed
    this.seaweed.forEach(seaweed => {
      this.drawSeaweed(seaweed);
    });

    // Draw corals
    this.corals.forEach(coral => {
      this.drawCoral(coral);
    });

    // Draw fish
    this.fish.forEach(fish => {
      this.drawFish(fish);
    });

    // Draw bubbles
    this.bubbles.forEach(bubble => {
      this.drawBubble(bubble);
    });

    // Add water shimmer effects
    this.drawWaterEffects();
  }

  drawSeaweed(seaweed) {
    this.ctx.fillStyle = seaweed.color;

    const segmentHeight = seaweed.height / seaweed.segments;
    let currentX = seaweed.x;
    let currentY = seaweed.y;

    for (let i = 0; i < seaweed.segments; i++) {
      const sway = Math.sin(seaweed.swayPhase + i * 0.5) * (i + 1) * 0.5;
      const segmentX = currentX + sway;

      this.ctx.fillRect(Math.floor(segmentX), Math.floor(currentY - segmentHeight), 2, Math.ceil(segmentHeight));

      currentX = segmentX;
      currentY -= segmentHeight;
    }
  }

  drawCoral(coral) {
    this.ctx.fillStyle = coral.color;

    const sway = Math.sin(coral.swayPhase) * 0.5;
    const x = Math.floor(coral.x + sway);
    const y = Math.floor(coral.y);

    switch (coral.type) {
      case 0: // Branch coral
        this.ctx.fillRect(x, y, coral.width, coral.height);
        // Add branches
        this.ctx.fillRect(x - 1, y + 2, 3, 2);
        this.ctx.fillRect(x + coral.width - 2, y + coral.height - 3, 3, 2);
        break;

      case 1: // Round coral
        this.drawCircle(x + coral.width/2, y + coral.height/2, coral.width/2);
        break;

      case 2: // Fan coral
        this.ctx.fillRect(x, y + coral.height - 2, coral.width, 2); // Base
        for (let i = 0; i < coral.width; i += 2) {
          const fanHeight = coral.height - 2 - i;
          if (fanHeight > 0) {
            this.ctx.fillRect(x + i, y, 1, fanHeight);
          }
        }
        break;
    }

    // Add coral polyps (small details)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 3; i++) {
      const px = x + Math.random() * coral.width;
      const py = y + Math.random() * coral.height;
      this.ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
    }
  }

  drawFish(fish) {
    const x = Math.floor(fish.x);
    const y = Math.floor(fish.y);

    this.ctx.fillStyle = fish.color;

    // Fish body (direction-dependent)
    if (fish.direction > 0) {
      // Swimming right
      this.ctx.fillRect(x, y, fish.size, 2);
      this.ctx.fillRect(x + fish.size - 1, y - 1, 2, 1); // Head
      this.ctx.fillRect(x - 1, y, 2, 1); // Tail
    } else {
      // Swimming left
      this.ctx.fillRect(x, y, fish.size, 2);
      this.ctx.fillRect(x - 1, y - 1, 2, 1); // Head
      this.ctx.fillRect(x + fish.size - 1, y, 2, 1); // Tail
    }

    // Add fins (animated)
    const finOffset = Math.sin(fish.swimPhase * 2) > 0 ? 1 : 0;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    if (fish.direction > 0) {
      this.ctx.fillRect(x + 1, y - 1 + finOffset, 1, 1); // Top fin
      this.ctx.fillRect(x + 1, y + 2 + finOffset, 1, 1); // Bottom fin
    } else {
      this.ctx.fillRect(x + fish.size - 2, y - 1 + finOffset, 1, 1); // Top fin
      this.ctx.fillRect(x + fish.size - 2, y + 2 + finOffset, 1, 1); // Bottom fin
    }

    // Eye
    this.ctx.fillStyle = '#000000';
    if (fish.direction > 0) {
      this.ctx.fillRect(x + fish.size, y, 1, 1);
    } else {
      this.ctx.fillRect(x - 1, y, 1, 1);
    }
  }

  drawBubble(bubble) {
    const alpha = 1 - (bubble.life / bubble.maxLife);
    this.ctx.fillStyle = `rgba(173, 216, 230, ${alpha * 0.8})`;

    const x = Math.floor(bubble.x);
    const y = Math.floor(bubble.y);

    if (bubble.size >= 2) {
      this.drawCircle(x, y, Math.floor(bubble.size));
    } else {
      this.ctx.fillRect(x, y, 1, 1);
    }
  }

  drawCircle(x, y, radius) {
    // Draw circle using rectangles
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          this.ctx.fillRect(x + dx, y + dy, 1, 1);
        }
      }
    }
  }

  drawWaterEffects() {
    // Sunlight rays
    for (let i = 0; i < 4; i++) {
      const x = 20 + i * 30;
      const waveOffset = Math.sin(this.time * 2 + i) * 5;

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let y = 0; y < 30; y += 3) {
        const rayX = x + waveOffset + Math.sin(y * 0.1) * 2;
        this.ctx.fillRect(Math.floor(rayX), y, 1, 2);
      }
    }

    // Water particles/debris
    for (let i = 0; i < 8; i++) {
      const x = (this.time * 5 + i * 20) % this.width;
      const y = 20 + Math.sin(this.time + i) * 15;

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
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
    this.fish = [];
    this.corals = [];
    this.bubbles = [];
    this.seaweed = [];
  }
}

// Create global instance
window.coralReef = new CoralReef();