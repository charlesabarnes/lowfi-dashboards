class ScrollingText {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Scrolling text configuration
    this.messages = [
      "WELCOME TO THE LED MATRIX",
      "MQTT PIXEL STREAMER ACTIVE",
      "REAL-TIME DASHBOARD SYSTEM",
      "STREAMING LIVE DATA",
      "PIXEL PERFECT DISPLAY",
      "POWERED BY JAVASCRIPT",
      "OBS STUDIO INTEGRATION"
    ];

    this.currentMessageIndex = 0;
    this.scrollPosition = this.width;
    this.scrollSpeed = 1;

    // Text styling
    this.fontSize = 12;
    this.lineHeight = 16;

    // Multiple text lines for variety
    this.textLines = [
      { text: "", x: this.width, y: 20, speed: 1, color: '#00FF00' },
      { text: "", x: this.width, y: 40, speed: 0.8, color: '#FF0080' }
    ];

    // Color cycling
    this.colorIndex = 0;
    this.colorChangeTimer = 0;
    this.colors = [
      '#00FF00', // Green
      '#FF0000', // Red
      '#0000FF', // Blue
      '#FFFF00', // Yellow
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#FF8000', // Orange
      '#8000FF'  // Purple
    ];

    // Background effects
    this.stars = [];
    this.initializeStars();

    this.lastTime = 0;
    this.frameRate = 16; // ~60fps (1000ms / 60fps ≈ 16ms)
  }

  init() {
    this.canvas = document.getElementById('text-canvas');
    if (!this.canvas) {
      console.error('Scrolling text canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Set initial messages
    this.textLines[0].text = this.messages[0];
    this.textLines[1].text = this.messages[1];

    // Start animation
    this.animate();
    console.log('Scrolling Text initialized');
  }

  initializeStars() {
    // Background stars for visual interest
    for (let i = 0; i < 20; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        brightness: Math.random(),
        speed: Math.random() * 0.5 + 0.1
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
    // Update text lines
    this.textLines.forEach((line, index) => {
      line.x -= line.speed;

      // Check if text has scrolled completely off screen
      this.ctx.font = `${this.fontSize}px monospace`;
      const textWidth = this.ctx.measureText(line.text).width;

      if (line.x < -textWidth) {
        // Reset position and get next message
        line.x = this.width + Math.random() * 50; // Add some random spacing
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
        line.text = this.messages[this.currentMessageIndex];

        // Change color when text resets
        line.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      }
    });

    // Update stars
    this.stars.forEach(star => {
      star.x -= star.speed;
      if (star.x < 0) {
        star.x = this.width;
        star.y = Math.random() * this.height;
        star.brightness = Math.random();
      }
      star.brightness += (Math.random() - 0.5) * 0.1;
      star.brightness = Math.max(0, Math.min(1, star.brightness));
    });

    // Color cycling timer
    this.colorChangeTimer++;
    if (this.colorChangeTimer > 180) { // Change every 3 seconds at 60fps
      this.colorChangeTimer = 0;
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw background stars
    this.drawStars();

    // Draw border decoration
    this.drawBorder();

    // Set font for text
    this.ctx.font = `${this.fontSize}px monospace`;
    this.ctx.textBaseline = 'middle';

    // Draw scrolling text lines
    this.textLines.forEach(line => {
      // Add text glow effect
      this.drawTextWithGlow(line.text, line.x, line.y, line.color);
    });

    // Draw time in corner
    this.drawTimeDisplay();

    // Draw animated separator lines
    this.drawSeparators();
  }

  drawStars() {
    this.stars.forEach(star => {
      if (star.brightness > 0.2) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        this.ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
      }
    });
  }

  drawBorder() {
    // Animated border
    const borderColor = this.colors[this.colorIndex];
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 1;

    // Top and bottom borders
    this.ctx.strokeRect(0, 0, this.width, this.height);

    // Moving dots along border
    const dotPosition = (Date.now() * 0.1) % (this.width * 2 + this.height * 2);
    let dotX, dotY;

    if (dotPosition < this.width) {
      dotX = dotPosition;
      dotY = 0;
    } else if (dotPosition < this.width + this.height) {
      dotX = this.width - 1;
      dotY = dotPosition - this.width;
    } else if (dotPosition < this.width * 2 + this.height) {
      dotX = this.width - (dotPosition - this.width - this.height);
      dotY = this.height - 1;
    } else {
      dotX = 0;
      dotY = this.height - (dotPosition - this.width * 2 - this.height);
    }

    this.ctx.fillStyle = borderColor;
    this.ctx.fillRect(Math.floor(dotX), Math.floor(dotY), 2, 2);
  }

  drawTextWithGlow(text, x, y, color) {
    // Main text
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, Math.floor(x), Math.floor(y));

    // Add subtle glow by drawing slightly offset copies
    this.ctx.fillStyle = color + '40'; // Add alpha for transparency
    this.ctx.fillText(text, Math.floor(x) - 1, Math.floor(y));
    this.ctx.fillText(text, Math.floor(x) + 1, Math.floor(y));
    this.ctx.fillText(text, Math.floor(x), Math.floor(y) - 1);
    this.ctx.fillText(text, Math.floor(x), Math.floor(y) + 1);
  }

  drawTimeDisplay() {
    // Small time display in corner
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.ctx.font = '8px monospace';
    this.ctx.fillStyle = '#808080';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(timeString, this.width - 2, 8);
    this.ctx.textAlign = 'left'; // Reset alignment
  }

  drawSeparators() {
    // Animated separator lines between text areas
    const time = Date.now() * 0.01;

    for (let x = 0; x < this.width; x += 8) {
      const waveOffset = Math.sin(time + x * 0.1) * 2;
      const y = 30 + waveOffset;

      this.ctx.fillStyle = '#444444';
      this.ctx.fillRect(x, Math.floor(y), 4, 1);
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

// Initialize global scrolling text
window.scrollingText = new ScrollingText();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.scrollingText) {
    window.scrollingText.destroy();
  }
});