import { BaseEntity } from "../BaseEntity";
import { SceneHandler } from "../SceneHandler/SceneHandler";

export class Mask {
  public enabled: boolean = false;
  public canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private maskCanvas: HTMLCanvasElement | null = null;
  private maskCtx: CanvasRenderingContext2D | null = null;

  /**
   * TODO: We should not create a static canvas for each object, but instead have one that fits all
   * Create and assign a static canvas to be used to render the context and create the mask content
   */
  private createStaticCanvas() {
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d");

    this.maskCanvas = document.createElement("canvas");
    const maskCtx = this.maskCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("Fail to create static canvas");
    }

    if (!maskCtx) {
      throw new Error("Fail to create the mask canvas");
    }

    this.ctx = ctx;
    this.maskCtx = maskCtx;
  }

  public setAsMask() {
    this.createStaticCanvas();
    this.enabled = true;
  }

  public disableMask() {
    this.canvas = null;
    this.ctx = null;

    this.maskCanvas = null;
    this.maskCtx = null;

    this.enabled = false;
  }

  public render(entity: BaseEntity) {
    if (!this.ctx || !this.maskCtx) {
      throw new Error(
        "Render should not be called before initialization - ctx is undefined",
      );
    }

    if (!this.canvas || !this.maskCanvas) {
      throw new Error(
        "Render should not be called before initialization - Canvas in undefined",
      );
    }

    this.canvas.setAttribute("width", `${entity.size.x}`);
    this.canvas.setAttribute("height", `${entity.size.y}`);
    this.maskCanvas.setAttribute("width", `${entity.size.x}`);
    this.maskCanvas.setAttribute("height", `${entity.size.y}`);

    this.ctx.transform(
      1, // a
      0, // b
      0, // c
      1, // d
      entity.size.x / 2, // e
      entity.size.y / 2, // f
    );

    this.maskCtx.transform(
      1, // a
      0, // b
      0, // c
      1, // d
      entity.size.x / 2, // e
      entity.size.y / 2, // f
    );

    const children = entity.children;
    const layerIterator = children.entries();
    let layerIteratorResult = layerIterator.next();

    this.ctx.save();
    while (!layerIteratorResult.done) {
      const [, layer] = layerIteratorResult.value;
      SceneHandler.currentScene.render.renderLayers(layer, this.ctx);
      layerIteratorResult = layerIterator.next();
    }

    this.ctx.restore();

    this.ctx.globalCompositeOperation = "destination-in";
    this.ctx.beginPath();
    entity.render(this.maskCtx);
    this.ctx.drawImage(this.maskCanvas, -entity.size.x / 2, -entity.size.y / 2);
    this.ctx.restore();

    return this.canvas;
  }
}
