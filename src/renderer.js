export class Renderer {
  constructor(canvas, config) {
    this.ctx         = canvas.getContext('2d');
    this.width       = canvas.width;
    this.height      = canvas.height;
    this.hueCycleMs  = config.HUE_CYCLE_MS;
    this.hueSpread   = config.HUE_SPREAD_DEG;
    this.stringCount = config.STRING_COUNT;
  }

  draw(strings, perfNow) {
    const ctx     = this.ctx;
    const now     = Date.now();
    const baseHue = (perfNow / this.hueCycleMs * 360) % 360;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.shadowBlur = 0;

    // Pass 1 — wide soft glow stroke (all strings, one state change)
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < strings.length; i++) {
      const hue = (baseHue + (i / this.stringCount) * this.hueSpread) % 360;
      const glow = strings[i].getGlow(now);
      ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.globalAlpha = 0.1 + glow * 0.25;
      ctx.lineWidth   = 5 + glow * 12;
      this._strokeString(ctx, strings[i]);
    }

    // Pass 2 — sharp center line (all strings)
    ctx.lineWidth   = 1;
    ctx.globalAlpha = 1;
    for (let i = 0; i < strings.length; i++) {
      const hue = (baseHue + (i / this.stringCount) * this.hueSpread) % 360;
      const glow = strings[i].getGlow(now);
      ctx.strokeStyle = `hsl(${hue}, 100%, ${62 + glow * 28}%)`;
      ctx.lineWidth   = 0.8 + glow * 0.7;
      ctx.globalAlpha = 0.85 + glow * 0.15;
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
