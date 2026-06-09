PROJECTION STRINGS
==================

REQUIREMENTS
- Node.js (https://nodejs.org) — any recent version
- A webcam
- Internet connection (MediaPipe hand tracking loads from CDN)

HOW TO RUN
----------
Option A: Double-click START.bat

Option B: Terminal
  npx serve . -l 8080
  Then open http://localhost:8080 in Chrome or Edge

NOTES
- Must run via a local server (not file:// — ES modules require HTTP)
- Click the screen once to unlock audio and start camera
- Press F to toggle fullscreen
- Works best in Chrome or Edge (Firefox may have issues with MediaPipe)
