export class AudioEngine {
  constructor(stringCount) {
    this.ctx = null;
    this.ready = false;
    this.queue = [];
    this.maxVoices = 3;
    this.lastFlush = 0;

    // Pentatonic C — low on left (index 0), high on right (index N-1), no repeats
    // 40 notes spanning C3 (130Hz) to ~C8 (4186Hz) on a pentatonic scale
    const pentatonic = ['C','D','E','G','A'];
    const octaves = [3,4,5,6,7,8];
    const allNotes = [];
    for (const oct of octaves) for (const n of pentatonic) allNotes.push(`${n}${oct}`);
    // Pick evenly spaced notes to exactly fill stringCount, no repeats
    const step = (allNotes.length - 1) / (stringCount - 1);
    this.freqMap = Array.from({ length: stringCount }, (_, i) =>
      this._noteToHz(allNotes[Math.round(i * step)])
    );
  }

  _noteToHz(note) {
    const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const oct = parseInt(note.slice(-1));
    const semitone = names.indexOf(note.slice(0, -1));
    return 440 * Math.pow(2, (semitone - 9 + (oct - 4) * 12) / 12);
  }

  unlock() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    // Convolver-style reverb via two allpass filters
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.35;

    const ap1 = this.ctx.createBiquadFilter();
    ap1.type = 'allpass';
    ap1.frequency.value = 800;
    const ap2 = this.ctx.createBiquadFilter();
    ap2.type = 'allpass';
    ap2.frequency.value = 1200;

    this.reverbGain.connect(ap1);
    ap1.connect(ap2);
    ap2.connect(this.ctx.destination);

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.65;
    this.dryGain.connect(this.ctx.destination);

    this.ready = true;

    // Flush on interval
    setInterval(() => this._flush(), 50);
  }

  trigger(stringIndex, velocity) {
    if (!this.ready) return;
    const freq = this.freqMap[stringIndex];
    if (!freq) return;
    const vol = Math.min(Math.max(velocity / 20, 0.15), 0.7);
    // Dedupe by frequency
    const existing = this.queue.findIndex(q => q.freq === freq);
    if (existing >= 0) this.queue[existing].vol = Math.max(this.queue[existing].vol, vol);
    else this.queue.push({ freq, vol });
  }

  _flush() {
    if (!this.queue.length || !this.ready) return;
    const batch = this.queue.splice(0, this.maxVoices);
    const now = this.ctx.currentTime;
    for (let i = 0; i < batch.length; i++) {
      this._playChime(batch[i].freq, batch[i].vol, now + i * 0.025);
    }
  }

  _playChime(freq, vol, startTime) {
    const ctx = this.ctx;
    const decay = 1.8;   // seconds — long shimmer tail

    // Primary sine tone
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    // Slight upper partial for metallic texture
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.756; // inharmonic partial like a real chime

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(vol, startTime + 0.002);     // instant attack
    env.gain.exponentialRampToValueAtTime(0.001, startTime + decay); // long decay

    const partialGain = ctx.createGain();
    partialGain.gain.value = 0.15; // partial much quieter than fundamental

    osc.connect(env);
    osc2.connect(partialGain);
    partialGain.connect(env);

    env.connect(this.dryGain);
    env.connect(this.reverbGain);

    osc.start(startTime);
    osc.stop(startTime + decay + 0.1);
    osc2.start(startTime);
    osc2.stop(startTime + decay + 0.1);
  }
}
