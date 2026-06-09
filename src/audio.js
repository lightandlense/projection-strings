export class AudioEngine {
  constructor(stringCount) {
    this.ready = false;

    const notes = ['C3','D3','E3','G3','A3','C4','D4','E4','G4','A4','C5','D5','E5','G5','A5'];
    this.noteMap = notes.slice(0, stringCount);

    this._initTone();
  }

  _initTone() {
    const reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).toDestination();

    this.synth = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.98,
    }).connect(reverb);

    this.ready = true;
  }

  trigger(stringIndex, velocity) {
    if (!this.ready) return;
    const note = this.noteMap[stringIndex];
    if (!note) return;

    const vol = Math.min(Math.max(velocity / 20, 0.1), 1.0);
    this.synth.triggerAttack(note, Tone.now(), vol);
  }
}
