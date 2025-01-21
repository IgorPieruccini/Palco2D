import { BaseEntity } from "./BaseEntity";
import { SerializedBaseEntityProps } from "./types";

export class SquareEntity extends BaseEntity {
  public color: string = "#eab676";

  render(ctx: CanvasRenderingContext2D) {
    if (this.globalCompositeOperation) {
      ctx.globalCompositeOperation = this.globalCompositeOperation;
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
  }

  public serialize(): SerializedBaseEntityProps & { color: string } {
    const data = super.serialize();
    return {
      ...data,
      type: "squareEntity",
      color: this.color,
    };
  }
}
