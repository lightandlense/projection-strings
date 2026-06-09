export class StringInst {
  /**
   * @param {number} x - resting X position (pixels)
   * @param {number} anchorY - Y position of the top anchor (pixels)
   * @param {number} nodeCount - number of nodes in the chain
   * @param {number} segmentLength - rest length between adjacent nodes (pixels)
   * @param {number} xOffset - cosmetic X jitter (±5px), does not affect trigger logic
   */
  constructor(x, anchorY, nodeCount, segmentLength, xOffset = 0) {
    this.restX = x;            // resting X — used for crossing detection
    this.xOffset = xOffset;    // cosmetic offset only
    this.nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const ny = anchorY + i * segmentLength;
      this.nodes.push({ x: x + xOffset, y: ny, px: x + xOffset, py: ny });
    }

    this.lastCrossingSide = null; // 'left' | 'right' — for crossing detection
    this.lastTriggerTime = 0;     // ms timestamp of last note trigger
  }

  /** Run one Verlet physics step.
   * @param {number} gravity - downward acceleration per frame
   * @param {number} damping - velocity multiplier per frame (e.g. 0.98)
   * @param {number} segmentLength - rest length between nodes
   */
  step(gravity, damping, segmentLength) {
    const nodes = this.nodes;

    // Integrate velocity (Verlet: new pos = pos + (pos - prevPos) * damping + acceleration)
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i];
      const vx = (n.x - n.px) * damping;
      const vy = (n.y - n.py) * damping + gravity;
      n.px = n.x;
      n.py = n.y;
      n.x += vx;
      n.y += vy;
    }

    // Lock anchor node (index 0) — cannot move
    nodes[0].x = this.restX + this.xOffset;
    nodes[0].px = nodes[0].x;
    nodes[0].y = nodes[0].y; // y stays where it was set at construction

    // Constraint relaxation — run 3 iterations for stability
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const diff = (dist - segmentLength) / dist;
        const correction = diff * 0.5;

        if (i === 0) {
          // anchor is fixed — push only the free node
          b.x -= dx * diff;
          b.y -= dy * diff;
        } else {
          a.x += dx * correction;
          a.y += dy * correction;
          b.x -= dx * correction;
          b.y -= dy * correction;
        }
      }
    }
  }

  /** Apply a push force to nodes within influenceRadius of (fx, fy).
   * @param {number} fx - finger X (pixels)
   * @param {number} fy - finger Y (pixels)
   * @param {number} influenceRadius - pixels
   */
  applyForce(fx, fy, influenceRadius) {
    for (let i = 1; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const dx = n.x - fx;
      const dy = n.y - fy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < influenceRadius && dist > 0) {
        const force = (influenceRadius - dist) / influenceRadius;
        const nx = dx / dist;
        const ny = dy / dist;
        // Apply as velocity delta (modify current pos relative to prev)
        n.x += nx * force * 8;
        n.y += ny * force * 8;
      }
    }
  }

  /** Draw this string onto a Canvas 2D context.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const nodes = this.nodes;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x, nodes[i].y);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /** Check if a fingertip has crossed this string's resting X position.
   * Returns crossing velocity magnitude if triggered, null otherwise.
   * @param {number} fx - finger X (pixels)
   * @param {number} prevFx - finger X last frame (pixels)
   * @param {number} vx - finger X velocity magnitude (px/frame)
   * @param {number} now - current timestamp (ms)
   * @param {number} debounceMs
   * @returns {number|null} velocity if triggered, null otherwise
   */
  checkCrossing(fx, prevFx, vx, now, debounceMs) {
    if (now - this.lastTriggerTime < debounceMs) return null;

    const rx = this.restX;
    const crossed = (prevFx < rx && fx >= rx) || (prevFx > rx && fx <= rx);
    if (!crossed) return null;

    this.lastTriggerTime = now;
    return Math.abs(vx);
  }
}
