import { BaseEntity } from "../BaseEntity";
import { SceneHandler } from "../SceneHandler/SceneHandler";
import { WorldHandler } from "../WorldHandler";

export class Mask {
  public enabled: boolean = false;
  public canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private maskCanvas: HTMLCanvasElement | null = null;
  private maskCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    // WorldHandler.subscribeToZoomUpdate(this._setCanvasSize);
  }

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

    // this._setCanvasSize();
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

  // private _setCanvasSize() {
  //   const zoom = WorldHandler.getZoom();
  //   if (!this.ctx || !this.maskCtx) {
  //     throw new Error(
  //       "Render should not be called before initialization - ctx is undefined",
  //     );
  //   }

  //   if (!this.canvas || !this.maskCanvas) {
  //     throw new Error(
  //       "Render should not be called before initialization - Canvas in undefined",
  //     );
  //   }

  //   this.canvas.setAttribute("width", `${entity.realSize.x * zoom} `);
  //   this.canvas.setAttribute("height", `${entity.realSize.y * zoom}`);
  //   this.maskCanvas.setAttribute("width", `${entity.realSize.x * zoom}`);
  //   this.maskCanvas.setAttribute("height", `${entity.realSize.y * zoom}`);
  // }

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

    const zoom = WorldHandler.getZoom();

    this.canvas.setAttribute("width", `${entity.realSize.x * zoom} `);
    this.canvas.setAttribute("height", `${entity.realSize.y * zoom}`);
    this.maskCanvas.setAttribute("width", `${entity.realSize.x * zoom}`);
    this.maskCanvas.setAttribute("height", `${entity.realSize.y * zoom}`);

    // masked elements
    this.ctx.save();
    this._setContextTransformation(this.ctx, entity);
    const children = entity.children;
    children.forEach((layer) => {
      if (this.ctx) {
        SceneHandler.currentScene.render.renderLayers(layer, this.ctx);
      }
    });
    this.ctx.restore();

    // the mask
    this.maskCtx.save();
    this._setContextTransformation(this.maskCtx, entity);
    this.ctx.globalCompositeOperation = "destination-in";
    entity.render(this.maskCtx);
    this.maskCtx.restore();

    this.ctx.drawImage(this.maskCanvas, 0, 0);
    return this.canvas;
  }

  private _setContextTransformation(
    ctx: CanvasRenderingContext2D,
    entity: BaseEntity,
  ) {
    const zoom = WorldHandler.getZoom();
    ctx.scale(zoom, zoom);

    const matrix = entity.matrix;
    ctx.transform(
      matrix[0][0], // a
      matrix[1][0], // b
      matrix[0][1], // c
      matrix[1][1], // d
      entity.realSize.x / 2, // e
      entity.realSize.y / 2, // f
    );
  }
}
