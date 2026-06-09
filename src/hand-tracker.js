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

    // Offscreen canvas used to pre-flip the video frame before MediaPipe sees it.
    // Many webcam drivers mirror the feed by default — this undoes that so
    // tip.x coordinates match physical left/right correctly.
    const flipCanvas = document.createElement('canvas');
    flipCanvas.width  = 640;
    flipCanvas.height = 480;
    const flipCtx = flipCanvas.getContext('2d');

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
        // Flip horizontally so mirrored driver feeds are corrected
        flipCtx.save();
        flipCtx.scale(-1, 1);
        flipCtx.drawImage(video, -flipCanvas.width, 0, flipCanvas.width, flipCanvas.height);
        flipCtx.restore();
        await hands.send({ image: flipCanvas });
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
    const x     = tip.x * this.canvasWidth;          // no mirror in code — flip handled in video pre-processing
    const y     = tip.y * this.canvasHeight;
    const prevX = this.prevX ?? x;
    this.prevX  = x;

    this.onUpdate([{ x, y, prevX }]);
  }
}
