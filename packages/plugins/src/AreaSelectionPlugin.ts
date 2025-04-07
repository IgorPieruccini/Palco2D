import { ScenePlugin } from "@palco-2d/core";
import { BoundingBox, Vec2 } from "@palco-2d/core/types";

export class AreaSelectionPlugin extends ScenePlugin {
  private startPoint: Vec2 | null = null;
  private bounds: BoundingBox | null = null;

  init() {
    this.scene.mouseHandler.onCanvas("mousedown", this.onMouseDown.bind(this));
    this.scene.mouseHandler.onCanvas("mousemove", this.onMouseMove.bind(this));
    this.scene.mouseHandler.onCanvas("mouseup", this.onMouseUp.bind(this));
    this.scene.mouseHandler.onEntity("mouseup", this.onMouseUp.bind(this));
  }

  onMouseDown() {
    this.startPoint = this.scene.mouseHandler.position;
  }

  onMouseMove() {
    if (this.startPoint) {
      const endPoint = this.scene.mouseHandler.position;
      this.bounds = {
        x: Math.min(this.startPoint.x, endPoint.x),
        y: Math.min(this.startPoint.y, endPoint.y),
        width: Math.abs(this.startPoint.x - endPoint.x),
        height: Math.abs(this.startPoint.y - endPoint.y),
      };
    }
  }

  onMouseUp() {
    this.startPoint = null;
    this.bounds = null;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.bounds) {
      ctx.save();
      ctx.strokeStyle = "#00c7ff";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        this.bounds.height,
      );
      ctx.fillStyle = "rgba(0, 199, 255, 0.2)";
      ctx.fillRect(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        this.bounds.height,
      );
      ctx.restore();
    }
  }
}
