# Projection Strings

Projection art installation — white vertical strings on black, physics-based interaction, harp audio.

## Stack
- Vanilla JS ES modules, no build step
- Canvas 2D for rendering
- MediaPipe Hands (CDN) for hand tracking
- Tone.js (CDN) for audio

## Launch
Open index.html in Chrome. For webcam access, serve locally:
  npx serve . -p 8080
Then open http://localhost:8080

## Key files
- src/string.js — String class + Verlet physics
- src/physics.js — PhysicsEngine simulation loop
- src/hand-tracker.js — MediaPipe wrapper
- src/audio.js — Tone.js audio engine
- src/renderer.js — Canvas draw loop
- src/main.js — CONFIG + init + rAF loop
