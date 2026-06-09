import { StringInst } from './string.js';
import { Renderer } from './renderer.js';
import { PhysicsEngine } from './physics.js';
import { HandTracker } from './hand-tracker.js';
import { AudioEngine } from './audio.js';

export const CONFIG = {
  STRING_COUNT: 15,
  NODES_PER_STRING: 20,
  INFLUENCE_RADIUS: 40,
  DAMPING: 0.98,
  GRAVITY: 0.3,
  TRIGGER_DEBOUNCE_MS: 300,
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
};

CONFIG.SEGMENT_LENGTH = CONFIG.CANVAS_HEIGHT / CONFIG.NODES_PER_STRING;

const canvas = document.getElementById('canvas');
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

const renderer = new Renderer(canvas);

const strings = [];
const spacing = CONFIG.CANVAS_WIDTH / (CONFIG.STRING_COUNT + 1);
for (let i = 0; i < CONFIG.STRING_COUNT; i++) {
  const x = spacing * (i + 1);
  const xOffset = (Math.random() - 0.5) * 10;
  strings.push(new StringInst(x, 0, CONFIG.NODES_PER_STRING, CONFIG.SEGMENT_LENGTH, xOffset));
}

const physics = new PhysicsEngine(strings, CONFIG);
const audio = new AudioEngine(CONFIG.STRING_COUNT);

let currentFingers = [];
let audioUnlocked = false;

const overlay = document.getElementById('overlay');
document.addEventListener('click', async () => {
  if (!audioUnlocked) {
    await Tone.start();
    audioUnlocked = true;
    overlay.classList.add('hidden');
    console.log('Audio unlocked');
  }
}, { once: true });

document.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
});

const tracker = new HandTracker(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, (fingers) => {
  currentFingers = fingers;
});

function loop() {
  physics.applyFingerForces(currentFingers);

  if (audioUnlocked) {
    const events = physics.checkCrossings(currentFingers, Date.now());
    for (const evt of events) {
      audio.trigger(evt.stringIndex, evt.velocity);
    }
  }

  physics.step();
  renderer.draw(strings);
  requestAnimationFrame(loop);
}

tracker.init().then(() => {
  requestAnimationFrame(loop);
}).catch((err) => {
  console.error('HandTracker init failed, running without hand tracking:', err);
  requestAnimationFrame(loop);
});

console.log('Projection Strings ready — click to unlock audio');
