export class HandTracker {
  constructor(canvasWidth, canvasHeight, onUpdate) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.onUpdate = onUpdate;
    this.prevPositions = {};
    this.active = false;
  }

  async init() {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => this._onResults(results));

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    await camera.start();
    this.active = true;
    console.log('HandTracker: webcam active');
  }

  _onResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      this.onUpdate([]);
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const tip = landmarks[8];

    const x = (1 - tip.x) * this.canvasWidth;
    const y = tip.y * this.canvasHeight;

    const prevX = this.prevPositions[8] ?? x;
    this.prevPositions[8] = x;

    this.onUpdate([{ x, y, prevX }]);
  }
}
