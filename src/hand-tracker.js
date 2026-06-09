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
      modelComplexity: 0,           // 0 = lite, faster
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => this._onResults(results));

    // Drive MediaPipe with rAF instead of Camera utility
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

    const tip  = results.multiHandLandmarks[0][8]; // index fingertip
    const x    = (1 - tip.x) * this.canvasWidth;   // mirror for facing-wall use: right hand = right strings
    const y    = tip.y * this.canvasHeight;
    const prevX = this.prevX ?? x;
    this.prevX  = x;

    this.onUpdate([{ x, y, prevX }]);
  }
}
