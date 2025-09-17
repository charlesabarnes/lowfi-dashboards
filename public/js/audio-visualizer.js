class AudioVisualizer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Audio visualization configuration
    this.bands = 32; // Number of frequency bands
    this.bandWidth = this.width / this.bands;
    this.audioData = new Array(this.bands).fill(0);
    this.smoothedData = new Array(this.bands).fill(0);
    this.peakData = new Array(this.bands).fill(0);

    // Mock audio data generation
    this.time = 0;
    this.bassFreq = 0.05;
    this.midFreq = 0.08;
    this.trebleFreq = 0.12;

    // Animation parameters
    this.smoothing = 0.7;
    this.peakDecay = 0.95;

    // LED-optimized colors for frequency bands
    this.colors = [
      '#FF0000', // Low frequencies (bass) - Red
      '#FF4000',
      '#FF8000', // Orange
      '#FFFF00', // Yellow
      '#80FF00',
      '#00FF00', // Mid frequencies - Green
      '#00FF80',
      '#00FFFF', // Cyan
      '#0080FF',
      '#0000FF', // High frequencies (treble) - Blue
      '#4000FF',
      '#8000FF', // Purple
      '#FF00FF', // Magenta
      '#FF0080'
    ];

    this.lastTime = 0;
    this.frameRate = 13; // ~75fps (1000ms / 75fps ≈ 13ms)
  }

  init() {
    this.canvas = document.getElementById('audio-canvas');
    if (!this.canvas) {
      console.error('Audio visualizer canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Audio Visualizer initialized');
  }

  generateMockAudioData() {
    // Generate realistic-looking audio data using multiple sine waves
    this.time += 0.1;

    for (let i = 0; i < this.bands; i++) {
      const bandRatio = i / this.bands;
      let amplitude = 0;

      // Bass frequencies (low bands)
      if (i < this.bands * 0.3) {
        amplitude += Math.abs(Math.sin(this.time * this.bassFreq + i * 0.3)) * 0.8;
        amplitude += Math.abs(Math.sin(this.time * this.bassFreq * 1.5 + i * 0.2)) * 0.4;
      }

      // Mid frequencies
      if (i >= this.bands * 0.2 && i < this.bands * 0.7) {
        amplitude += Math.abs(Math.sin(this.time * this.midFreq + i * 0.4)) * 0.6;
        amplitude += Math.abs(Math.sin(this.time * this.midFreq * 2 + i * 0.1)) * 0.3;
      }

      // Treble frequencies (high bands)
      if (i >= this.bands * 0.5) {
        amplitude += Math.abs(Math.sin(this.time * this.trebleFreq + i * 0.5)) * 0.5;
        amplitude += Math.abs(Math.sin(this.time * this.trebleFreq * 3 + i * 0.3)) * 0.2;
      }

      // Add some random variation
      amplitude += Math.random() * 0.1;

      // Add occasional "beats"
      if (Math.sin(this.time * 0.3) > 0.8) {
        amplitude *= 1.5;
      }

      // Normalize and store
      this.audioData[i] = Math.min(amplitude, 1.0);
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
    // Generate mock audio data
    this.generateMockAudioData();

    // Smooth the audio data and update peaks
    for (let i = 0; i < this.bands; i++) {
      // Smooth current data
      this.smoothedData[i] = this.smoothedData[i] * this.smoothing +
                             this.audioData[i] * (1 - this.smoothing);

      // Update peaks
      if (this.smoothedData[i] > this.peakData[i]) {
        this.peakData[i] = this.smoothedData[i];
      } else {
        this.peakData[i] *= this.peakDecay;
      }
    }
  }

  getColorForBand(bandIndex) {
    const colorIndex = Math.floor((bandIndex / this.bands) * this.colors.length);
    return this.colors[Math.min(colorIndex, this.colors.length - 1)];
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw frequency bars
    for (let i = 0; i < this.bands; i++) {
      const x = i * this.bandWidth;
      const barHeight = Math.floor(this.smoothedData[i] * (this.height - 2));
      const peakHeight = Math.floor(this.peakData[i] * (this.height - 2));
      const color = this.getColorForBand(i);

      // Draw main frequency bar
      if (barHeight > 0) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
          Math.floor(x),
          this.height - barHeight,
          Math.floor(this.bandWidth - 1),
          barHeight
        );
      }

      // Draw peak indicator
      if (peakHeight > 0 && peakHeight > barHeight + 2) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(
          Math.floor(x),
          this.height - peakHeight - 1,
          Math.floor(this.bandWidth - 1),
          1
        );
      }
    }

    // Draw waveform at the top
    this.drawWaveform();

    // Draw VU meter style indicators
    this.drawVUMeters();
  }

  drawWaveform() {
    // Simple waveform visualization at the top
    this.ctx.strokeStyle = '#808080';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    const waveHeight = 8;
    const centerY = waveHeight / 2;

    for (let x = 0; x < this.width; x++) {
      const bandIndex = Math.floor((x / this.width) * this.bands);
      const amplitude = this.smoothedData[bandIndex] || 0;
      const y = centerY + (amplitude - 0.5) * waveHeight;

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  drawVUMeters() {
    // Calculate overall levels
    let bassLevel = 0;
    let midLevel = 0;
    let trebleLevel = 0;

    for (let i = 0; i < this.bands; i++) {
      if (i < this.bands * 0.3) bassLevel += this.smoothedData[i];
      else if (i < this.bands * 0.7) midLevel += this.smoothedData[i];
      else trebleLevel += this.smoothedData[i];
    }

    bassLevel /= (this.bands * 0.3);
    midLevel /= (this.bands * 0.4);
    trebleLevel /= (this.bands * 0.3);

    // Draw VU meters on the right side
    const meterX = this.width - 6;
    const meterHeight = 20;
    const startY = 15;

    // Bass meter (red)
    this.drawMeter(meterX, startY, bassLevel, '#FF0000');

    // Mid meter (green)
    this.drawMeter(meterX + 2, startY, midLevel, '#00FF00');

    // Treble meter (blue)
    this.drawMeter(meterX + 4, startY, trebleLevel, '#0000FF');
  }

  drawMeter(x, y, level, color) {
    const meterHeight = 20;
    const segments = 10;
    const segmentHeight = meterHeight / segments;

    for (let i = 0; i < segments; i++) {
      const segmentY = y + meterHeight - (i + 1) * segmentHeight;
      const threshold = (i + 1) / segments;

      if (level >= threshold) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, Math.floor(segmentY), 1, Math.floor(segmentHeight - 1));
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

// Initialize global audio visualizer
window.audioVisualizer = new AudioVisualizer();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.audioVisualizer) {
    window.audioVisualizer.destroy();
  }
});