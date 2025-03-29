import { Scene, ScenePlugin } from "@palco-2d/core";

export class ActiveSelectionPlugin extends ScenePlugin {
  init() {
    this.scene.eventHandler.subscribeToAddEntity((entity) => {
      entity.on("mousedown", () => {
        console.log("Entity selected:", entity.id);
      });
    });
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
