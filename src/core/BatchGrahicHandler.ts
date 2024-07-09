export class BatchGraphicHandler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private batches: Record<string, HTMLCanvasElement> = {};

  constructor() {
    this.canvas = document.createElement("canvas");
    if (this.canvas === null) {
      throw new Error("Could not create canvas");
    }

    const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    if (ctx === null) {
      throw new Error("Could not get canvas context");
    }

    this.ctx = ctx;
  }

  /**
   * Create a offscreeen canvas and draw on it
   * @param draw - function to draw on the canvas context
   * @example
   * const offscreenCanvas = this.canvas.batchRender.getBatch(this.batchKey);
   * ctx.drawImage(offscreenCanvas,x,y);
   */
  batch(
    draw: (ctx: CanvasRenderingContext2D) => void,
    width: number,
    height: number,
    key: string,
  ) {
    if (this.batches[key]) {
      return;
    }

    if (this.canvas === null) {
      throw new Error("Could not create canvas");
    }
    this.canvas.width = width;
    this.canvas.height = height;

    if (this.ctx === null) {
      throw new Error("Could not get canvas context");
    }

    draw(this.ctx);

    this.batches[key] = this.canvas;
  }

  /**
   * get a batched drawing by key
   */
  getBatch(key: string) {
    if (!this.batches[key]) {
      throw new Error(`No batched drawing found for ${key}`);
    }
    return this.batches[key];
  }
}

