import { StringInst } from './string.js';

export class PhysicsEngine {
  /**
   * @param {StringInst[]} strings
   * @param {object} config - CONFIG object from main.js
   */
  constructor(strings, config) {
    this.strings = strings;
    this.config = config;
  }

  /** Run one physics step for all strings.
   * Call once per animation frame, before rendering.
   */
  step() {
    for (const s of this.strings) {
      s.step(this.config.GRAVITY, this.config.DAMPING, this.config.SEGMENT_LENGTH);
    }
  }

  /** Apply finger push forces to all strings.
   * @param {{x: number, y: number}[]} fingers - array of fingertip positions in canvas pixels
   */
  applyFingerForces(fingers) {
    for (const finger of fingers) {
      for (const s of this.strings) {
        s.applyForce(finger.x, finger.y, this.config.INFLUENCE_RADIUS);
      }
    }
  }

  /** Check crossings and return triggered events.
   * @param {{x: number, y: number, prevX: number}[]} fingers - fingers with previous X
   * @param {number} now - Date.now()
   * @returns {{stringIndex: number, velocity: number}[]}
   */
  checkCrossings(fingers, now) {
    const events = [];
    for (const finger of fingers) {
      const vx = finger.x - finger.prevX;
      let hitsThisFrame = 0;
      for (let i = 0; i < this.strings.length; i++) {
        if (hitsThisFrame >= 3) break; // cap crossings per frame
        const velocity = this.strings[i].checkCrossing(
          finger.x, finger.prevX, vx, now, this.config.TRIGGER_DEBOUNCE_MS
        );
        if (velocity !== null) {
          events.push({ stringIndex: i, velocity });
          hitsThisFrame++;
        }
      }
    }
    return events;
  }
}
