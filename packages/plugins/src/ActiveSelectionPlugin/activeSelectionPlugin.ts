import { BaseEntity, ScenePlugin, WorldHandler } from "@palco-2d/core";
import { BoundingBox, Vec2 } from "@palco-2d/core/types";
import { getBoundingFromEntities } from "@palco-2d/core/src/utils";
import { ActiveSelectionManager } from "../ActiveSelectionManager";

/**
 * Listen to active selection updated and render the outline bounds
 * for the selected entities, to indicate the active selection to users
 */
export class ActiveSelectionPlugin extends ScenePlugin {
  private boundingSelectionBox: BoundingBox | null = null;

  init() {
    this.scene.mouseHandler.onCanvas("mousedown", () => {
      this.boundingSelectionBox = null;
    });
  }

  onActiveSelectionUpdate(_: BaseEntity, entities: BaseEntity[]) {
    this.boundingSelectionBox = getBoundingFromEntities(entities);
  }

  render(ctx: CanvasRenderingContext2D) {
    ActiveSelectionManager.selectedEntities.forEach((entity) => {
      const corners = entity.coords.corners;
      ctx.save();
      ctx.strokeStyle = "#00c7ff";
      ctx.lineWidth = 1 / WorldHandler.getZoom();
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

    if (
      ActiveSelectionManager.selectedEntities.size > 1 &&
      this.boundingSelectionBox
    ) {
      ctx.save();
      ctx.strokeStyle = "#00c7ff";
      ctx.lineWidth = 1 / WorldHandler.getZoom();
      ctx.strokeRect(
        this.boundingSelectionBox.x,
        this.boundingSelectionBox.y,
        this.boundingSelectionBox.width,
        this.boundingSelectionBox.height,
      );
      ctx.restore();
    }
  }
}
