import { BaseEntity } from "../BaseEntity";
import { SceneHandler } from "../SceneHandler/SceneHandler";
import { WorldHandler } from "../WorldHandler";

export class Mask {
  public cached: boolean = false;
  public useAsMask: boolean = false;
  public canvas: HTMLCanvasElement | null = null;

  private ctx: CanvasRenderingContext2D | null = null;
  private maskCanvas: HTMLCanvasElement | null = null;
  private maskCtx: CanvasRenderingContext2D | null = null;
  private entity: BaseEntity | null = null;
  private zoomSubscription: string | null = null;

  constructor(entity: BaseEntity) {
    this.entity = entity;
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
  }

  public setAsMask() {
    this.createStaticCanvas();
    this.cached = false;
    this.useAsMask = true;
    this.zoomSubscription = WorldHandler.subscribeToZoomUpdate(
      this.updateCanvasSize.bind(this),
    );
    this.updateCanvasSize();
  }

  public disableMask() {
    this.canvas = null;
    this.ctx = null;
    this.maskCanvas = null;
    this.maskCtx = null;
    this.cached = false;
    this.useAsMask = false;

    if (this.zoomSubscription) {
      WorldHandler.unsubscribeFromZoomUpdate(this.zoomSubscription);
    }
  }

  private getCoreProps() {
    if (!this.entity) {
      throw new Error("Entity needs to be set before calling _setCanvasSize");
    }

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

    return {
      canvas: this.canvas,
      ctx: this.ctx,
      maskCanvas: this.maskCanvas,
      maskCtx: this.maskCtx,
      entity: this.entity,
    };
  }

  public updateCanvasSize() {
    const { canvas, maskCanvas, entity } = this.getCoreProps();

    const zoom = WorldHandler.getZoom();

    canvas.setAttribute("width", `${entity.realSize.x * zoom} `);
    canvas.setAttribute("height", `${entity.realSize.y * zoom}`);
    maskCanvas.setAttribute("width", `${entity.realSize.x * zoom}`);
    maskCanvas.setAttribute("height", `${entity.realSize.y * zoom}`);

    this.cached = false;
  }

  public render() {
    const { canvas, ctx, maskCanvas, maskCtx, entity } = this.getCoreProps();

    if (this.cached) return canvas;
    this.cached = true;

    // masked elements
    ctx.save();
    this._setContextTransformation(ctx, entity);
    const children = entity.children;
    children.forEach((layer) => {
      if (ctx) {
        SceneHandler.currentScene.render.renderLayers(layer, ctx);
      }
    });
    ctx.restore();

    // the mask
    maskCtx.save();
    this._setContextTransformation(maskCtx, entity);
    ctx.globalCompositeOperation = "destination-in";
    entity.render(maskCtx);
    maskCtx.restore();

    ctx.drawImage(maskCanvas, 0, 0);

    return canvas;
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
