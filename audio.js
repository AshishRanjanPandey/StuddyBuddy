/**
 * audio.js - Web Audio API Synthesizer for SFX & Ambient Soundscapes
 * Zero external audio files required; runs 100% reliably offline.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.ambientType = 'none';
    this.ambientGain = null;
    this.ambientSource = null;
    this.ambientMasterVolume = 0.5;
    this.ambientLFO = null;
  }

  // Lazy-initialize audio context on first user gesture
  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --------------------------------------------------------------------------
  // Sound Effects (SFX)
  // --------------------------------------------------------------------------

  // Crystal bell / chime for timer completion
  playTimerChime() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.6);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Flip card whoosh / subtle tap
  playCardFlip() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Soft high resonance click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Quiz correct answer - cheerful chime
  playCorrect() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const freqs = [587.33, 739.99, 880]; // D5, F#5, A5

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.6);
      });
    } catch (e) {}
  }

  // Quiz wrong answer - gentle muted bump
  playWrong() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.2);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // Simple button click
  playClick() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // Ambient Soundscapes (Rain, White Noise, Pink Noise, Alpha Focus)
  // --------------------------------------------------------------------------

  setAmbientVolume(vol) {
    this.ambientMasterVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain) {
      const ctx = this.getAudioContext();
      this.ambientGain.gain.setValueAtTime(this.ambientMasterVolume, ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        if (typeof this.ambientSource.stop === 'function') {
          this.ambientSource.stop();
        }
        if (this.ambientSource.disconnect) {
          this.ambientSource.disconnect();
        }
      } catch (e) {}
      this.ambientSource = null;
    }
    if (this.ambientLFO) {
      try {
        this.ambientLFO.stop();
        this.ambientLFO.disconnect();
      } catch (e) {}
      this.ambientLFO = null;
    }
    this.ambientType = 'none';
  }

  playAmbient(type) {
    this.stopAmbient();
    if (type === 'none') return;

    const ctx = this.getAudioContext();
    this.ambientType = type;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.ambientMasterVolume, ctx.currentTime);
    this.ambientGain.connect(ctx.destination);

    if (type === 'rain') {
      this._createRainSound(ctx);
    } else if (type === 'white') {
      this._createWhiteNoise(ctx);
    } else if (type === 'pink') {
      this._createPinkNoise(ctx);
    } else if (type === 'alpha') {
      this._createAlphaFocus(ctx);
    }
  }

  // Continuous rain synthesis using filtered pink noise and low-pass sweep
  _createRainSound(ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    // Subtle gentle modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 0.2Hz gentle swell
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.ambientLFO = lfo;

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    whiteNoise.start();
    this.ambientSource = whiteNoise;
  }

  // Clean White Noise
  _createWhiteNoise(ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    whiteNoise.start();
    this.ambientSource = whiteNoise;
  }

  // Deep Pink Noise
  _createPinkNoise(ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
    }

    const pinkSource = ctx.createBufferSource();
    pinkSource.buffer = noiseBuffer;
    pinkSource.loop = true;

    pinkSource.connect(this.ambientGain);
    pinkSource.start();
    this.ambientSource = pinkSource;
  }

  // 432Hz Alpha Focus Tone (Binaural Drone)
  _createAlphaFocus(ctx) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz focus

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(442, ctx.currentTime); // 10 Hz Alpha beat differential!

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.08, ctx.currentTime);

    osc1.connect(subGain);
    osc2.connect(subGain);
    subGain.connect(this.ambientGain);

    osc1.start();
    osc2.start();

    this.ambientSource = {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (e) {}
      },
      disconnect: () => {
        try {
          osc1.disconnect();
          osc2.disconnect();
          subGain.disconnect();
        } catch (e) {}
      }
    };
  }
}

// Global Sound instance
window.soundEngine = new SoundEngine();
