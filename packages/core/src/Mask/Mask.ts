import { BaseEntity } from "../BaseEntity";
import { SceneHandler } from "../SceneHandler/SceneHandler";

export class Mask {
  public enabled: boolean = false;
  public canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private entity: BaseEntity;

  constructor(entity: BaseEntity) {
    // Store the entity render method so we can batch the ctx into a static canvas
    this.entity = entity;
  }

  /**
   * TODO: We should not create a static canvas for each object, but instead have one that fits all
   * Create and assign a static canvas to be used to render the context and create the mask content
   */
  private createStaticCanvas() {
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d");
    // document.body.append(this.canvas);
    // this.canvas.setAttribute("style", "position:absolute");
    if (!ctx) {
      throw new Error("Fail to create static canvas");
    }

    this.ctx = ctx;
  }

  public setAsMask() {
    this.createStaticCanvas();

    if (!this.ctx) {
      throw new Error("SetAsMask should not be called before initialization");
    }

    this.enabled = true;
  }

  public disableMask() {
    this.canvas = null;
    this.ctx = null;
    this.enabled = false;
  }

  public render(entity: BaseEntity) {
    if (!this.ctx) {
      throw new Error(
        "Render should not be called before initialization - ctx is undefined",
      );
    }

    if (!this.canvas) {
      throw new Error(
        "Render should not be called before initialization - Canvas in undefined",
      );
    }

    this.canvas.setAttribute("width", `${entity.size.x}`);
    this.canvas.setAttribute("height", `${entity.size.y}`);

    this.ctx.transform(
      1, // a
      0, // b
      0, // c
      1, // d
      entity.size.x / 2, // e
      entity.size.y / 2, // f
    );

    const children = this.entity.children;
    const layerIterator = children.entries();
    let layerIteratorResult = layerIterator.next();

    this.ctx.save();
    while (!layerIteratorResult.done) {
      const [, layer] = layerIteratorResult.value;
      SceneHandler.currentScene.render.renderLayers(layer, this.ctx);
      layerIteratorResult = layerIterator.next();
    }

    this.ctx.restore();

    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.beginPath();
    entity.render(this.ctx);
    this.ctx.restore();

    return this.canvas;
  }
}
