import { EntityPlugin } from "@palco-2d/core";

export class BoundingBoxEntity extends EntityPlugin {
  render(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.strokeRect(
      -this.entity.size.x / 2,
      -this.entity.size.y / 2,
      this.entity.size.x,
      this.entity.size.y,
    );
  }
}
