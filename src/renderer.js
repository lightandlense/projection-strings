export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
  }

  /** Clear canvas to black and draw all strings.
   * @param {import('./string.js').StringInst[]} strings
   */
  draw(strings) {
    const ctx = this.ctx;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    for (const s of strings) {
      s.draw(ctx);
    }
  }
}
