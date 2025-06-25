import { BaseEntity } from "../BaseEntity";

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
   * Create and asing a static canvas to be used to render the context and create the mask content
   */
  private createStaticCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.entity.size.x;
    this.canvas.height = this.entity.size.y;

    const ctx = this.canvas.getContext("2d");
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

    this.entity.render(this.ctx);
    this.enabled = true;
  }

  public disableMask() {
    this.canvas = null;
    this.ctx = null;
    this.enabled = false;
  }
}
