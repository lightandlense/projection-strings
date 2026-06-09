export const CONFIG = {
  STRING_COUNT: 15,
  NODES_PER_STRING: 20,
  INFLUENCE_RADIUS: 40,
  DAMPING: 0.98,
  GRAVITY: 0.3,
  TRIGGER_DEBOUNCE_MS: 300,
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
  SEGMENT_LENGTH: null, // computed at init: CANVAS_HEIGHT / NODES_PER_STRING
};

const canvas = document.getElementById('canvas');
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

console.log('Projection Strings initializing...');
