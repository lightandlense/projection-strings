export class HandTracker {
  constructor(canvasWidth, canvasHeight, onUpdate) {
    this.canvasWidth  = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.onUpdate     = onUpdate;
    this.prevX        = null;
    this.active       = false;
  }

  resize(w, h) {
    this.canvasWidth  = w;
    this.canvasHeight = h;
  }

  async init() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    await video.play();

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => this._onResults(results));

    const sendFrame = async () => {
      if (video.readyState >= 2) {
        await hands.send({ image: video });
      }
      requestAnimationFrame(sendFrame);
    };

    await hands.initialize();
    this.active = true;
    requestAnimationFrame(sendFrame);
    console.log('HandTracker: active');
  }

  _onResults(results) {
    if (!results.multiHandLandmarks?.length) {
      this.onUpdate([]);
      return;
    }

    const tip   = results.multiHandLandmarks[0][8]; // index fingertip
    const x     = tip.x * this.canvasWidth;          // camera mirrors + display mirrors = double flip = no flip
    const y     = tip.y * this.canvasHeight;
    const prevX = this.prevX ?? x;
    this.prevX  = x;

    this.onUpdate([{ x, y, prevX }]);
  }
}
