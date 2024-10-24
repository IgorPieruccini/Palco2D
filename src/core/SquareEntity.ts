import { BaseEntity } from "./BaseEntity";

export class SquareEntity extends BaseEntity {
  public color: string = "#eab676";

  render(ctx: CanvasRenderingContext2D) {
    if (this.globalCompositeOperation) {
      ctx.globalCompositeOperation = this.globalCompositeOperation;
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
  }

}
