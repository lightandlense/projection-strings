export class Renderer {
  constructor(canvas, config) {
    this.ctx         = canvas.getContext('2d');
    this.width       = canvas.width;
    this.height      = canvas.height;
    this.hueCycleMs  = config.HUE_CYCLE_MS;
    this.hueSpread   = config.HUE_SPREAD_DEG;
    this.stringCount = config.STRING_COUNT;
  }

  resize(w, h) {
    this.width  = w;
    this.height = h;
  }

  draw(strings, perfNow) {
    const ctx     = this.ctx;
    const now     = Date.now();
    const baseHue = (perfNow / this.hueCycleMs * 360) % 360;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.shadowBlur = 0;

    // Pass 1 — soft glow on pluck
    for (let i = 0; i < strings.length; i++) {
      const glow = strings[i].getGlow(now);
      if (glow <= 0) continue;
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = glow * 0.3;
      ctx.lineWidth   = 5 + glow * 10;
      this._strokeString(ctx, strings[i]);
    }

    // Pass 2 — sharp white line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 1.2;
    ctx.globalAlpha = 1;
    for (let i = 0; i < strings.length; i++) {
      this._strokeString(ctx, strings[i]);
    }

    ctx.globalAlpha = 1;
  }

  _strokeString(ctx, s) {
    const nodes = s.nodes;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x, nodes[i].y);
    }
    ctx.stroke();
  }
}
