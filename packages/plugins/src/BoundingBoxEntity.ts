import { EntityPlugin } from "@palco-2d/core";

export class BoundingBoxEntity extends EntityPlugin {
  render(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.entity.boundingBox;
    ctx.strokeStyle = "red";
    ctx.strokeRect(x, y, width, height);
  }
}
