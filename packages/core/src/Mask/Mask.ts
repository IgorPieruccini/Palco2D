import { BaseEntity } from "../BaseEntity";
import { SceneHandler } from "../SceneHandler/SceneHandler";
import { WorldHandler } from "../WorldHandler";

/**
 * Mask is responsible for masking children elements.
 * it uses the parent element graphics to mask the children.
 */
export class Mask {
  /**
   * Indicates whether the mask is cached.
   * if true the render will not recalculated but instead use the cached canvas. (the previous drawing)
   */
  public cached: boolean = false;

  /**
   * Indicates whether the mask is used.
   * if true the render logic will run to mask the children elements.
   */
  public useAsMask: boolean = false;

  /**
   * Static canvas for rendering the elements that are masked
   */
  private maskedElementsCanvas: HTMLCanvasElement | null = null;

  /**
   * Static canvas for rendering the msk element
   */
  private maskingCanvas: HTMLCanvasElement | null = null;

  /**
   * Context of the maskedElementsCanvas
   */
  private maskedElementsCtx: CanvasRenderingContext2D | null = null;

  /**
   * Context of the maskingCanvas
   */
  private maskingElementCtx: CanvasRenderingContext2D | null = null;

  /**
   * A reference to the element that is used as mask
   */
  private entity: BaseEntity | null = null;

  /**
   * Subscription to the zoom update event, it's used to know when to invalidate the current cached
   * so when zooming into a mask, the mask re-renders maintaining high quality image
   */
  private zoomSubscription: string | null = null;

  constructor(entity: BaseEntity) {
    this.entity = entity;
  }

  /**
   * Set the entity to be used as mask
   */
  public setAsMask() {
    this.createStaticCanvas();
    this.cached = false;
    this.useAsMask = true;
    this.zoomSubscription = WorldHandler.subscribeToZoomUpdate(
      this.updateCanvasSize.bind(this),
    );
    this.updateCanvasSize();
  }

  /**
   * Set the entity to NOT be a mask,
   * resets all mask properties
   */
  public disableMask() {
    this.maskedElementsCanvas = null;
    this.maskedElementsCtx = null;
    this.maskingCanvas = null;
    this.maskingElementCtx = null;
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
      this.maskedElementsCtx?.clearRect(
        0,
        0,
        this.maskedElementsCanvas?.width || 0,
        this.maskedElementsCanvas?.height || 0,
      );

      this.maskingElementCtx?.clearRect(
        0,
        0,
        this.maskingCanvas?.width || 0,
        this.maskingCanvas?.height || 0,
      );
    }

    this.cached = false;
  }

  /**
   * Updates the canvas size used to render the mask depending on the entity size to maintain the crispy high quality rendering
   * to prevent low performance due to rendering a large mask, we limit the canvas size to the size of the screen
   */
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
      // THIS IS CLIPPING THE MASK WRONGLY WHEN ZOOMED IN
      // NEEDS TO BE FIXED
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

  /*
   * Render children elements inside the mask, the mask being the parent element graphics
   */
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

  /**
   * Creates the canvas and Canvas2DContext that will be use to render the mask
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

    this.maskedElementsCtx = ctx;
    this.maskingElementCtx = maskCtx;
  }

  /**
   * Sets the transformation matrix for the given context
   */
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

  /**
   * A method to help checking if all required props for rendering the canvas is defined
   */
  private getCoreProps() {
    if (!this.entity) {
      throw new Error("Entity needs to be set before calling _setCanvasSize");
    }

    if (!this.maskedElementsCtx || !this.maskingElementCtx) {
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
      ctx: this.maskedElementsCtx,
      maskCanvas: this.maskingCanvas,
      maskCtx: this.maskingElementCtx,
      entity: this.entity,
    };
  }
}
