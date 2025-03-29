import { Scene, ScenePlugin } from "@palco-2d/core";

export class ActiveSelectionPlugin extends ScenePlugin {
  constructor(scene: Scene) {
    super(scene);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(0, 0, 100, 100);
    ctx.restore();
  }
}
