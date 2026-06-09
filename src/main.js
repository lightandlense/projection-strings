import { StringInst } from './string.js';
import { Renderer } from './renderer.js';
import { PhysicsEngine } from './physics.js';
import { HandTracker } from './hand-tracker.js';
import { AudioEngine } from './audio.js';

export const CONFIG = {
  STRING_COUNT: 60,
  NODES_PER_STRING: 20,
  INFLUENCE_RADIUS: 40,
  DAMPING: 0.98,
  GRAVITY: 0.3,
  TRIGGER_DEBOUNCE_MS: 300,
  HUE_CYCLE_MS: 30000,    // full hue rotation period
  HUE_SPREAD_DEG: 30,     // hue spread across all strings
  GLOW_PULSE_DURATION: 800, // ms for pluck bloom to decay
  NEIGHBOR_BLEED: 2,      // strings on each side that receive pluck energy
};

const canvas = document.getElementById('canvas');

function resizeCanvas() {
  CONFIG.CANVAS_WIDTH  = window.innerWidth;
  CONFIG.CANVAS_HEIGHT = window.innerHeight;
  CONFIG.SEGMENT_LENGTH = CONFIG.CANVAS_HEIGHT / (CONFIG.NODES_PER_STRING - 1);
  canvas.width  = CONFIG.CANVAS_WIDTH;
  canvas.height = CONFIG.CANVAS_HEIGHT;
  // Rebuild strings to fill the new dimensions
  rebuildStrings();
  if (renderer) renderer.resize(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  if (tracker)  tracker.resize(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
}

// Initial values before first resize
CONFIG.CANVAS_WIDTH  = window.innerWidth;
CONFIG.CANVAS_HEIGHT = window.innerHeight;
CONFIG.SEGMENT_LENGTH = CONFIG.CANVAS_HEIGHT / (CONFIG.NODES_PER_STRING - 1);
canvas.width  = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

let renderer = new Renderer(canvas, CONFIG);
let physics;

const strings = [];
function rebuildStrings() {
  strings.length = 0;
  // Strings span edge-to-edge: first string at x=0, last at x=CANVAS_WIDTH
  const spacing = CONFIG.CANVAS_WIDTH / (CONFIG.STRING_COUNT - 1);
  for (let i = 0; i < CONFIG.STRING_COUNT; i++) {
    const x = spacing * i;
    strings.push(new StringInst(x, 0, CONFIG.NODES_PER_STRING, CONFIG.SEGMENT_LENGTH, 0));
  }
  physics = new PhysicsEngine(strings, CONFIG);
}
rebuildStrings();

const audio = new AudioEngine(CONFIG.STRING_COUNT);

window.addEventListener('resize', resizeCanvas);
window.addEventListener('fullscreenchange', resizeCanvas);

let currentFingers = [];
let audioUnlocked = false;
let handTrackingActive = false;

// Mouse fallback — always active, overridden by hand tracking when it works
let mouseFinger = null;
let prevMouseX = null;
const status = document.getElementById('status');

let pendingMouseX = null;
let pendingMouseY = null;

canvas.addEventListener('mousemove', (e) => {
  if (handTrackingActive) return;
  pendingMouseX = e.clientX;
  pendingMouseY = e.clientY;
});

canvas.addEventListener('mouseleave', () => {
  mouseFinger = null;
  pendingMouseX = null;
});

const overlay = document.getElementById('overlay');
document.addEventListener('click', () => {
  if (!audioUnlocked) {
    audio.unlock();
    audioUnlocked = true;
    overlay.classList.add('hidden');
    tracker.init().then(() => {
      handTrackingActive = true;
      status.textContent = 'hand tracking active';
    }).catch((err) => {
      console.warn('HandTracker init failed:', err);
      status.textContent = 'camera unavailable — mouse mode';
    });
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

let tracker = new HandTracker(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, (fingers) => {
  currentFingers = fingers;
});

function loop() {
  const now = Date.now();

  // Consume pending mouse position once per frame (throttles fast swipes)
  if (!handTrackingActive && pendingMouseX !== null) {
    const prevX = prevMouseX ?? pendingMouseX;
    prevMouseX = pendingMouseX;
    mouseFinger = { x: pendingMouseX, y: pendingMouseY, prevX };
    pendingMouseX = null;
    pendingMouseY = null;
  }

  const fingers = handTrackingActive ? currentFingers : (mouseFinger ? [mouseFinger] : []);
  physics.applyFingerForces(fingers);

  if (audioUnlocked) {
    const events = physics.checkCrossings(fingers, now);
    for (const evt of events) {
      audio.trigger(evt.stringIndex, evt.velocity);
      // glow pulse on triggered string
      strings[evt.stringIndex].triggerGlow(now, CONFIG.GLOW_PULSE_DURATION);
      // bleed energy to neighbors
      for (let d = 1; d <= CONFIG.NEIGHBOR_BLEED; d++) {
        const strength = 1 - d / (CONFIG.NEIGHBOR_BLEED + 1);
        const left = evt.stringIndex - d;
        const right = evt.stringIndex + d;
        if (left >= 0) strings[left].triggerGlow(now, CONFIG.GLOW_PULSE_DURATION, strength * 0.5);
        if (right < strings.length) strings[right].triggerGlow(now, CONFIG.GLOW_PULSE_DURATION, strength * 0.5);
      }
    }
  }

  physics.step();
  renderer.draw(strings, performance.now());
  frameCount++;
  requestAnimationFrame(loop);
}

status.textContent = 'mouse mode — move cursor over strings';

// FPS counter
let frameCount = 0;
let lastFpsTime = performance.now();
setInterval(() => {
  const now = performance.now();
  const fps = Math.round(frameCount / ((now - lastFpsTime) / 1000));
  frameCount = 0;
  lastFpsTime = now;
  const mode = handTrackingActive ? 'hand tracking' : 'mouse mode';
  status.textContent = `${mode} | ${fps} fps | ${CONFIG.STRING_COUNT} strings`;
}, 500);

requestAnimationFrame(loop);

console.log('Projection Strings ready — click to unlock audio');
