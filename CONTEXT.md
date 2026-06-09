# Current Project
Redesigning the visual layer to match a TouchDesigner + Kinect neon line aesthetic. The physics and audio are solid — this pass is purely about how it looks. Target: dense glowing curtain of colored vertical strings that pulse and bloom on interaction.

# What good looks like
- ~40 thin vertical strings filling the full 1920×1080 canvas
- All strings share a single hue that slowly rotates through the full color spectrum every ~30 seconds
- Each string has a layered glow: wide soft shadowBlur pass underneath + sharp 1px center line on top
- When a string is plucked, it emits a large soft bloom (shadowBlur ~40px) that decays over ~800ms
- Pluck force bleeds to ±2 neighboring strings at decreasing strength
- Runs smoothly at 60fps — no jank

# What to avoid
- White strings — color is the whole point now
- Flat strokes with no glow — must have the layered bloom look
- Hard color boundaries between strings — hue shifts gradually across the field
- Re-engineering the physics or audio — those are locked, visual layer only
