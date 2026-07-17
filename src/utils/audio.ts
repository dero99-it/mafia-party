/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy loaded AudioContext on user interaction
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.1);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {
      console.warn('Audio click failed', e);
    }
  }

  playCardFlip() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Soft white noise-like click for card flips
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {
      console.warn('Audio card flip failed', e);
    }
  }

  playRevealSting() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Dramatic synth rise for role reveal
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(120, t);
      osc1.frequency.linearRampToValueAtTime(320, t + 0.6);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(240, t);
      osc2.frequency.linearRampToValueAtTime(640, t + 0.6);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.7);
      osc2.stop(t + 0.7);
    } catch (e) {
      console.warn('Audio reveal failed', e);
    }
  }

  playEliminated() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Deep descending death gong/chime
      const osc = this.ctx.createOscillator();
      const oscDetune = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.linearRampToValueAtTime(50, t + 1.2);

      oscDetune.type = 'sawtooth';
      oscDetune.frequency.setValueAtTime(102, t);
      oscDetune.frequency.linearRampToValueAtTime(51, t + 1.2);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      osc.connect(gain);
      oscDetune.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      oscDetune.start(t);
      osc.stop(t + 1.5);
      oscDetune.stop(t + 1.5);
    } catch (e) {
      console.warn('Audio elimination failed', e);
    }
  }

  playCitizenDeath() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Mournful sad minor chord progression with weeping sliding frequency
      const notes = [220.00, 261.63, 311.13, 196.00]; // A3, C4, Eb4 (A dim/minor), G3
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + index * 0.18);
        osc.frequency.linearRampToValueAtTime(freq - 15, t + index * 0.18 + 0.8);

        gain.gain.setValueAtTime(0.0, t + index * 0.18);
        gain.gain.linearRampToValueAtTime(0.1, t + index * 0.18 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.18 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + index * 0.18);
        osc.stop(t + index * 0.18 + 0.9);
      });
    } catch (e) {
      console.warn('Audio playCitizenDeath failed', e);
    }
  }

  playMafiaDeath() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Bright, rapid triumphant major chord rise (optimistic)
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + index * 0.07);

        gain.gain.setValueAtTime(0.0, t + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.06, t + index * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.07 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + index * 0.07);
        osc.stop(t + index * 0.07 + 0.5);
      });
    } catch (e) {
      console.warn('Audio playMafiaDeath failed', e);
    }
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Cheerful major arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + index * 0.15);

        gain.gain.setValueAtTime(0.0, t + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.08, t + index * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.15 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + index * 0.15);
        osc.stop(t + index * 0.15 + 0.5);
      });
    } catch (e) {
      console.warn('Audio victory failed', e);
    }
  }

  playDefeat() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Sad descending trombone minor slide
      const notes = [220.00, 207.65, 196.00, 174.61]; // A3, Ab3, G3, F3
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + index * 0.25);
        if (index === notes.length - 1) {
          osc.frequency.linearRampToValueAtTime(freq - 15, t + index * 0.25 + 0.6);
        }

        gain.gain.setValueAtTime(0.0, t + index * 0.25);
        gain.gain.linearRampToValueAtTime(0.1, t + index * 0.25 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.25 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + index * 0.25);
        osc.stop(t + index * 0.25 + 0.7);
      });
    } catch (e) {
      console.warn('Audio defeat failed', e);
    }
  }

  playNightAmbient() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Soft, low-frequency hum to set the mood
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(82, t + 2);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.2);
    } catch (e) {
      console.warn('Audio ambient failed', e);
    }
  }
}

export const sfx = new SoundEffectsManager();
