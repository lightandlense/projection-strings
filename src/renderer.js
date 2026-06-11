// Theme definitions. Cycle with the "C" key (see main.js).
//  - neon  : black background, glowing hue-cycling strings (the original look)
//  - light : white background, hue-cycling colored strings
//  - ink   : white background, solid black strings (clean / minimal / print-friendly)
export const THEMES = ['neon', 'light', 'ink'];

export class Renderer {
  constructor(canvas, config) {
    this.ctx         = canvas.getContext('2d');
    this.width       = canvas.width;
    this.height      = canvas.height;
    this.hueCycleMs  = config.HUE_CYCLE_MS;
    this.hueSpread   = config.HUE_SPREAD_DEG;
    this.stringCount = config.STRING_COUNT;
    this.theme       = config.THEME || 'neon';
  }

  resize(w, h) {
    this.width  = w;
    this.height = h;
  }

  setTheme(theme) {
    this.theme = theme;
  }

  draw(strings, perfNow) {
    const ctx     = this.ctx;
    const now     = Date.now();
    const baseHue = (perfNow / this.hueCycleMs * 360) % 360;
    const count   = strings.length || 1;

    const dark = this.theme === 'neon';
    const ink  = this.theme === 'ink';

    // Background
    ctx.fillStyle = dark ? '#000' : '#fff';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.shadowBlur = 0;

    // Per-string colour for the current theme.
    //  - neon/light : each string takes a hue, spread across the field, all
    //    slowly rotating through the spectrum.
    //  - ink        : solid black, no hue.
    const stringColor = (i) => {
      if (ink) return '#000';
      const hue = (baseHue + (i / count) * this.hueSpread) % 360;
      const light = dark ? 60 : 45; // colored lines read better slightly darker on white
      return `hsl(${hue}, 90%, ${light}%)`;
    };

    // Pass 1 — soft glow on pluck (skipped for ink: a flat black line, no bloom)
    if (!ink) {
      for (let i = 0; i < strings.length; i++) {
        const glow = strings[i].getGlow(now);
        if (glow <= 0) continue;
        ctx.strokeStyle = stringColor(i);
        ctx.globalAlpha = glow * (dark ? 0.3 : 0.22);
        ctx.lineWidth   = 5 + glow * 10;
        ctx.shadowBlur  = dark ? 40 * glow : 0;
        ctx.shadowColor = stringColor(i);
        this._strokeString(ctx, strings[i]);
      }
      ctx.shadowBlur = 0;
    }

    // Pass 2 — sharp center line
    ctx.globalAlpha = 1;
    for (let i = 0; i < strings.length; i++) {
      ctx.strokeStyle = stringColor(i);
      ctx.lineWidth   = ink ? 1.6 : 1.2;
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
