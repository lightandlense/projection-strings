# References

## Visual Reference
- "Interactive Lines Test 01 - TouchDesigner + Kinect" https://youtu.be/oPZMb7hLJGY
  Dense neon vertical lines deforming around body movement. Key qualities: strong bloom glow, slow color shift across the field, lines feel like a luminous curtain.

## Design Decisions (2026-06-09)
- Orientation: vertical strings (keep harp interaction model)
- Density: ~40 strings (dense/intense)
- Color: slow hue shift — all strings share one hue rotating full spectrum over ~30s
- Pluck effect: glow pulse — large soft bloom decays over ~800ms, no white flash
- Neighbor bleed: pluck energy spreads ±2 strings at decreasing strength

## Rendering Technique
Layered glow on Canvas 2D:
1. Set ctx.shadowColor + ctx.shadowBlur (large, e.g. 12px) → draw string path → creates soft halo
2. Set ctx.shadowBlur = 0, thinner lineWidth → draw same path again → sharp center line on top
3. On pluck: add a third pass with shadowBlur driven by a decaying envelope (start ~40px, ease to 0 over 800ms)

## Hue Shift Formula
```js
const hue = (performance.now() / 30000 * 360) % 360; // full rotation every 30s
const stringHue = (hue + (i / STRING_COUNT) * 30) % 360; // slight spread across field
ctx.strokeStyle = `hsl(${stringHue}, 100%, 60%)`;
ctx.shadowColor  = `hsl(${stringHue}, 100%, 70%)`;
```

## Config Reference (src/main.js)
- STRING_COUNT: 15 → change to 40
- INFLUENCE_RADIUS: 40
- DAMPING: 0.98
- GRAVITY: 0.3
- CANVAS_WIDTH: 1920, CANVAS_HEIGHT: 1080
