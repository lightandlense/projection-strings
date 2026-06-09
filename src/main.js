import { StringInst } from './string.js';
import { Renderer } from './renderer.js';
import { PhysicsEngine } from './physics.js';

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

// Stub fingers array — no interaction yet, just physics loop
let fingers = [];

function loop() {
  physics.step();
  renderer.draw(strings);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
console.log('Physics loop running');
