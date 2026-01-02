export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;

  constructor() {
    // Context is initialized on user interaction
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4; // Master volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startDrone();
  }

  private startDrone() {
    if (!this.ctx || !this.masterGain || this.droneOsc) return;

    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();
    this.lfo = this.ctx.createOscillator();

    // Main Drone: Low Sawtooth for Sci-Fi Texture
    this.droneOsc.type = 'sawtooth';
    this.droneOsc.frequency.setValueAtTime(45, this.ctx.currentTime); // Deep rumble start

    // Lowpass Filter to smooth out the sawtooth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);
    filter.Q.value = 1;

    // LFO to modulate Filter Frequency (Breathing effect)
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // Slow cycle (~6.6s)
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(40, this.ctx.currentTime); // Modulate filter cutoff +/- 40Hz
    
    this.lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    this.lfo.start();

    this.droneGain.gain.setValueAtTime(0.06, this.ctx.currentTime); // Subtle volume

    this.droneOsc.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    
    this.droneOsc.start();
  }

  public setDronePitch(fatigueLevel: number) {
    if (!this.ctx || !this.droneOsc) return;
    // Map fatigue (0-100) to Pitch (45Hz - 85Hz)
    // As fatigue rises, the engine sounds more "strained" (higher pitch)
    const targetFreq = 45 + (fatigueLevel * 0.4); 
    this.droneOsc.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 2);
    
    // Also increase volume slightly with fatigue/stress
    if (this.droneGain) {
        const targetVol = 0.06 + (fatigueLevel * 0.0004); // 0.06 -> 0.1
        this.droneGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 2);
    }
  }

  public playDrowsyAlert() {
    // Urgent pulsating double-beep (Medical Monitor style)
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const playTone = (start: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine'; // Pure tone
        osc.frequency.setValueAtTime(700, start); 
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.02); // Fast attack
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15); // Fast decay
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(start);
        osc.stop(start + 0.2);
    }

    playTone(t);
    playTone(t + 0.25); // 250ms gap
  }

  public playCriticalAlarm() {
    // Sharp, continuous alarm (Klaxon / Red Alert)
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square'; // Harsh wave for danger
    osc.frequency.setValueAtTime(1200, t); 
    osc.frequency.setValueAtTime(1000, t + 0.15); // Two-tone effect 1200 -> 1000

    // Envelope
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.25);
    gain.gain.linearRampToValueAtTime(0, t + 0.3); // Cut off
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.3);
  }

  public playPing() {
    // Sonar ping (System check)
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  public playComputing() {
    // Rapid data processing ticks
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    for(let i=0; i<3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 2000 + Math.random() * 1000;
        gain.gain.value = 0.03;
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.03);
    }
  }

  public playClick() {
    // Sharp UI interaction
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}

export const soundEngine = new SoundEngine();