class LavaLamp {
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

    // Lava blobs
    this.blobs = [];
    this.maxBlobs = 6;

    // Temperature effect
    this.temperature = 0;

    this.initializeBlobs();
  }

  init() {
    this.canvas = document.getElementById('lava-lamp-canvas');
    if (!this.canvas) {
      console.error('Lava Lamp canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Lava Lamp initialized with 75fps targeting');
  }

  initializeBlobs() {
    const colors = ['#ff4500', '#ff6347', '#ff0000', '#dc143c', '#b22222', '#8b0000'];

    for (let i = 0; i < this.maxBlobs; i++) {
      this.blobs.push({
        x: 20 + Math.random() * 88,
        y: 20 + Math.random() * 24,
        targetY: 20 + Math.random() * 24,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 8 + 6,
        targetRadius: Math.random() * 8 + 6,
        color: colors[i % colors.length],
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        density: Math.random() * 0.5 + 0.5, // Controls rise/sink behavior
        heat: Math.random()
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
    // Update temperature cycle
    this.temperature = Math.sin(this.time * 0.5) * 0.5 + 0.5;

    this.blobs.forEach((blob, index) => {
      // Update phase for organic movement
      blob.phase += blob.speed;

      // Heat affects blob behavior
      blob.heat = 0.3 + this.temperature * 0.7 + Math.sin(blob.phase) * 0.2;

      // Density affects vertical movement
      const densityEffect = (blob.density - blob.heat) * 0.5;

      // Target position based on density and heat
      if (blob.heat > blob.density) {
        // Blob rises
        blob.targetY = Math.max(10, blob.targetY - 0.3);
      } else {
        // Blob sinks
        blob.targetY = Math.min(50, blob.targetY + 0.2);
      }

      // Smooth movement toward target
      blob.vy += (blob.targetY - blob.y) * 0.002;
      blob.vy *= 0.95; // Damping

      // Horizontal wobble
      blob.vx += Math.sin(blob.phase * 2) * 0.001;
      blob.vx *= 0.98; // Damping

      // Update position
      blob.x += blob.vx;
      blob.y += blob.vy;

      // Keep blobs within lamp bounds
      if (blob.x < 25) {
        blob.x = 25;
        blob.vx *= -0.5;
      }
      if (blob.x > 103) {
        blob.x = 103;
        blob.vx *= -0.5;
      }

      // Vertical bounds with wrapping for continuous cycle
      if (blob.y < 5) {
        blob.y = 55;
        blob.density = Math.random() * 0.5 + 0.5;
      }
      if (blob.y > 55) {
        blob.y = 5;
        blob.density = Math.random() * 0.5 + 1.0;
      }

      // Size pulsing based on heat
      blob.targetRadius = 6 + blob.heat * 6 + Math.sin(blob.phase * 3) * 2;
      blob.radius += (blob.targetRadius - blob.radius) * 0.1;

      // Blob merging/interaction
      this.blobs.forEach((otherBlob, otherIndex) => {
        if (index !== otherIndex) {
          const dx = blob.x - otherBlob.x;
          const dy = blob.y - otherBlob.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Attraction/repulsion based on temperature
          if (distance < blob.radius + otherBlob.radius + 5) {
            const force = (blob.heat + otherBlob.heat) * 0.001;
            const angle = Math.atan2(dy, dx);

            blob.vx += Math.cos(angle) * force;
            blob.vy += Math.sin(angle) * force;
          }
        }
      });
    });
  }

  render() {
    // Clear canvas with dark background
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw lamp base
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(15, 55, 98, 9);

    // Draw lamp top
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(15, 0, 98, 8);

    // Draw lamp sides
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(15, 8, 5, 47);
    this.ctx.fillRect(108, 8, 5, 47);

    // Draw lamp liquid background
    this.ctx.fillStyle = '#001122';
    this.ctx.fillRect(20, 8, 88, 47);

    // Draw heating element at bottom
    const heatIntensity = Math.floor(this.temperature * 255);
    this.ctx.fillStyle = `rgb(${heatIntensity}, ${Math.floor(heatIntensity * 0.3)}, 0)`;
    this.ctx.fillRect(25, 50, 78, 5);

    // Draw lava blobs
    this.blobs.forEach(blob => {
      this.drawBlob(blob);
    });

    // Add some bubbles for extra effect
    this.drawBubbles();
  }

  drawBlob(blob) {
    // Draw blob using filled rectangles to approximate circle
    const centerX = Math.floor(blob.x);
    const centerY = Math.floor(blob.y);
    const radius = Math.floor(blob.radius);

    // Use different shades based on heat
    const heatFactor = blob.heat;
    let color = blob.color;

    if (heatFactor > 0.8) {
      color = '#ffff00'; // Hot = yellow
    } else if (heatFactor > 0.6) {
      color = '#ff6347'; // Warm = orange-red
    } else if (heatFactor > 0.4) {
      color = '#ff4500'; // Medium = red-orange
    } else {
      color = '#8b0000'; // Cool = dark red
    }

    this.ctx.fillStyle = color;

    // Draw blob as filled circle approximation
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= radius * radius) {
          const pixelX = centerX + x;
          const pixelY = centerY + y;

          // Only draw inside lamp bounds
          if (pixelX >= 20 && pixelX < 108 && pixelY >= 8 && pixelY < 55) {
            this.ctx.fillRect(pixelX, pixelY, 1, 1);
          }
        }
      }
    }

    // Add highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(centerX - 2, centerY - 2, 2, 2);
  }

  drawBubbles() {
    // Small bubbles rising through the liquid
    const bubbleCount = 8;
    for (let i = 0; i < bubbleCount; i++) {
      const x = 25 + (i * 10) + Math.sin(this.time * 2 + i) * 3;
      const y = 45 - ((this.time * 10 + i * 20) % 40);

      if (x >= 20 && x < 108 && y >= 8 && y < 55) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
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
    this.blobs = [];
  }
}

// Create global instance
window.lavaLamp = new LavaLamp();