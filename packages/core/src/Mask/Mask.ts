import { BaseEntity } from "../BaseEntity";
import { SceneHandler } from "../SceneHandler/SceneHandler";
import { WorldHandler } from "../WorldHandler";
import { getScaleFromMatrix } from "../utils";

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

    const zoom = WorldHandler.getZoom();
    const entityScale = entity.getScale();

    const entityScaledSize = {
      x: entity.size.x * entityScale.x,
      y: entity.size.y * entityScale.y,
    };

    const matrixScale = getScaleFromMatrix(entity.matrix);

    // TODO: does not need to be set on every frame
    this.canvas.setAttribute("width", `${entityScaledSize.x * zoom} `);
    this.canvas.setAttribute("height", `${entityScaledSize.y * zoom}`);
    this.maskCanvas.setAttribute("width", `${entityScaledSize.x * zoom}`);
    this.maskCanvas.setAttribute("height", `${entityScaledSize.y * zoom}`);

    // SET WORLD ZOOM
    this.ctx.save();
    this.ctx.scale(zoom, zoom);
    this.ctx.save();

    const matrix = entity.matrix;
    this.ctx.transform(
      matrix[0][0], // a
      matrix[1][0], // b
      matrix[0][1], // c
      matrix[1][1], // d
      entityScaledSize.x / 2, // e
      entityScaledSize.y / 2, // f
    );

    const children = entity.children;
    children.forEach((layer) => {
      if (this.ctx) {
        SceneHandler.currentScene.render.renderLayers(layer, this.ctx);
      }
    });

    this.ctx.restore();
    this.ctx.restore();

    this.maskCtx.scale(zoom, zoom);

    this.maskCtx.save();
    this.maskCtx.scale(entity.getScale().x, entity.getScale().y);
    this.maskCtx.translate(entity.size.x / 2, entity.size.y / 2);

    this.ctx.globalCompositeOperation = "destination-in";
    entity.render(this.maskCtx);
    this.maskCtx.restore();

    this.ctx.drawImage(this.maskCanvas, 0, 0);

    return this.canvas;
  }
}
