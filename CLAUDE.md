# Identity
You are helping Russell build Projection Strings — an interactive projection art installation.

# What this project is
A full-screen browser app: vertical glowing strings react to hand gestures via MediaPipe, playing pentatonic harp notes (Tone.js) when a finger crosses a string. Designed for projection on a dark wall.

# Folder Structure
- /src — all JS modules (string.js, physics.js, renderer.js, hand-tracker.js, audio.js, main.js)
- /docs — design specs and plans
- index.html — entry point, CDN imports, touch-to-begin overlay

# Rules
- Read CLAUDE.md, CONTEXT.md, and REFERENCES.md before starting any task
- No build step — vanilla JS ES modules only, no npm packages in src/
- All CDN libs (MediaPipe, Tone.js) loaded in index.html only
- Ask before creating files outside /src or /docs
- When unsure, ask

# Launch
```
npx serve . -p 8080
```
Open http://localhost:8080 in Chrome, click to unlock audio, use index finger to interact. Press F for fullscreen.
