// Sound Manager for game audio effects
class SoundManagerClass {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.1) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported
    }
  }

  private playNoise(duration: number, volume: number = 0.1) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported
    }
  }

  playShoot(weaponName: string) {
    switch (weaponName) {
      case 'Pistol':
        this.playTone(180, 0.08, 'square', 0.12);
        this.playNoise(0.05, 0.08);
        break;
      case 'SMG':
        this.playTone(250, 0.04, 'square', 0.08);
        this.playNoise(0.03, 0.06);
        break;
      case 'Assault Rifle':
        this.playTone(150, 0.07, 'sawtooth', 0.12);
        this.playNoise(0.06, 0.1);
        break;
      case 'Shotgun':
        this.playTone(60, 0.15, 'sawtooth', 0.2);
        this.playNoise(0.12, 0.2);
        setTimeout(() => this.playTone(40, 0.1, 'triangle', 0.1), 20);
        break;
      case 'Sniper':
        this.playTone(500, 0.1, 'sine', 0.15);
        this.playTone(80, 0.25, 'sawtooth', 0.12);
        this.playNoise(0.08, 0.1);
        break;
      case 'Minigun':
        this.playTone(300, 0.025, 'square', 0.06);
        this.playNoise(0.02, 0.04);
        break;
      default:
        this.playTone(180, 0.08, 'square', 0.1);
    }
  }

  playEnemyShoot() {
    this.playTone(120, 0.06, 'sawtooth', 0.06);
  }

  playHit() {
    this.playTone(100, 0.15, 'triangle', 0.1);
  }

  playKill() {
    this.playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(800, 0.15, 'sine', 0.1), 100);
  }

  playPickup() {
    this.playTone(500, 0.08, 'sine', 0.08);
    setTimeout(() => this.playTone(700, 0.1, 'sine', 0.08), 80);
  }

  playDamage() {
    this.playTone(80, 0.2, 'sawtooth', 0.1);
  }

  playZoneDamage() {
    this.playTone(50, 0.3, 'sine', 0.03);
  }

  playVictory() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.15), i * 150);
    });
  }

  playGameOver() {
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.1), i * 200);
    });
  }
}

export const SoundManager = new SoundManagerClass();
