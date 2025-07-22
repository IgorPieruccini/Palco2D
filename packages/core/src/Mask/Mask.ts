import { BaseEntity } from "../BaseEntity";
import { SceneHandler } from "../SceneHandler/SceneHandler";
import { WorldHandler } from "../WorldHandler";

export class Mask {
  public cached: boolean = false;
  public useAsMask: boolean = false;

  /**
   * Canvas for rendering the elements that are masked
   */
  private maskedElementsCanvas: HTMLCanvasElement | null = null;

  /**
   * Canvas for rendering the msk element
   */
  private maskingCanvas: HTMLCanvasElement | null = null;

  private ctx: CanvasRenderingContext2D | null = null;
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
    this.maskedElementsCanvas = document.createElement("canvas");
    const ctx = this.maskedElementsCanvas.getContext("2d");

    this.maskingCanvas = document.createElement("canvas");
    const maskCtx = this.maskingCanvas.getContext("2d");

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
    this.maskedElementsCanvas = null;
    this.ctx = null;
    this.maskingCanvas = null;
    this.maskCtx = null;
    this.cached = false;
    this.useAsMask = false;

    if (this.zoomSubscription) {
      WorldHandler.unsubscribeFromZoomUpdate(this.zoomSubscription);
    }
  }

  /**
   * Clear canvas context and cached property to ensure
   * next time render is called recreates the mask
   */
  public forceUpdate() {
    if (this.entity) {
      this.ctx?.clearRect(
        0,
        0,
        this.entity?.realSize.x,
        this.entity?.realSize.x,
      );

      this.maskCtx?.clearRect(
        0,
        0,
        this.entity?.realSize.x,
        this.entity?.realSize.x,
      );
    }

    this.cached = false;
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

    if (!this.maskedElementsCanvas || !this.maskingCanvas) {
      throw new Error(
        "Render should not be called before initialization - Canvas in undefined",
      );
    }

    return {
      canvas: this.maskedElementsCanvas,
      ctx: this.ctx,
      maskCanvas: this.maskingCanvas,
      maskCtx: this.maskCtx,
      entity: this.entity,
    };
  }

  public updateCanvasSize() {
    const { canvas, maskCanvas, entity } = this.getCoreProps();

    const zoom = WorldHandler.getZoom();

    let width = entity.realSize.x * zoom;
    let height = entity.realSize.y * zoom;

    // If the mask width or height is less than one we need to make sure to set to 1, canvas size can not be less than 1
    if (width <= 1 || height <= 1) {
      width = 1;
      height = 1;
      // otherwise we need to check if the mask is larger than the main canvas, if it is we set the mask to the size of the main canvas,
      // to preventing low performance due to rendering a large mask
    } else {
      const canvasWidth = SceneHandler.currentScene.canvas.width;
      const canvasHeight = SceneHandler.currentScene.canvas.height;

      if (width > canvasWidth) {
        width = canvasWidth;
      }

      if (height > canvasHeight) {
        height = canvasHeight;
      }
    }

    canvas.setAttribute("width", `${width} `);
    canvas.setAttribute("height", `${height}`);
    maskCanvas.setAttribute("width", `${width}`);
    maskCanvas.setAttribute("height", `${height}`);

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
