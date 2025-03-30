import { BaseEntity, ScenePlugin, WorldHandler } from "@palco-2d/core";

export class ActiveSelectionPlugin extends ScenePlugin {
  selectedEntities: Map<string, BaseEntity> = new Map();

  init() {
    this.scene.eventHandler.subscribeToAddEntity((entity) => {
      entity.on("mouseup", () => {
        this.clearSelection();
        this.selectedEntities.set(entity.id, entity);
      });
    });

    this.scene.mouseHandler.onCanvas("mouseup", () => {
      this.clearSelection();
      this.selectedEntities.clear();
    });
  }

  clearSelection() {
    this.selectedEntities.clear();
  }

  render(ctx: CanvasRenderingContext2D) {
    this.selectedEntities.forEach((entity) => {
      const corners = entity.coords.corners;
      ctx.save();
      ctx.strokeStyle = "#00c7ff";
      ctx.lineWidth = 2 / WorldHandler.getZoom();
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[2].x, corners[2].y);
      ctx.lineTo(corners[3].x, corners[3].y);
      ctx.lineTo(corners[0].x, corners[0].y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });
  }
}
