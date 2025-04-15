import { BaseEntity, WorldHandler } from "@palco-2d/core";
import { Vec2 } from "@palco-2d/core/types";

const SIZE: Vec2 = {
  x: 30,
  y: 30,
};

export class RotateControl extends BaseEntity {
  constructor() {
    super({
      id: "rotateControl",
      position: { x: 0, y: 0 },
      size: SIZE,
      rotation: 0,
      isUI: true,
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1 / WorldHandler.getZoom();
    ctx.fillStyle = "red";
    ctx.strokeRect(-SIZE.x / 2, -SIZE.y / 2, SIZE.x, SIZE.y);
    ctx.restore();
  }
}
