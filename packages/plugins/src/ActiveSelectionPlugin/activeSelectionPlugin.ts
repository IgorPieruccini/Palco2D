import { BaseEntity, ScenePlugin, WorldHandler } from "@palco-2d/core";
import { BoundingBox, Vec2 } from "@palco-2d/core/types";
import { getBoundingFromEntities } from "@palco-2d/core/src/utils";
import { ActiveSelectionManager } from "../ActiveSelectionManager";

export class ActiveSelectionPlugin extends ScenePlugin {
  private holdingEntity: BaseEntity | null = null;
  private lastClickPosition: Vec2 | null = null;
  private clickDistanceFromEntity: Vec2 | null = null;
  private boundingSelectionBox: BoundingBox | null = null;

  init() {
    this.activeSelectionHandler.onActiveSelection(
      (entity: BaseEntity, entities: BaseEntity[]) => {
        if (entities.length === 0) {
          this.clearMouseData();
          return;
        }

        entity.on("mouseup", () => {
          if (this.holdingEntity) {
            this.holdingEntity = null;
          }
        });

        this.holdingEntity = entity;

        if (entity.parent) {
          const relativePosition = entity.getRelativePostion(
            this.scene.mouseHandler.position,
            true,
          );
          this.lastClickPosition = relativePosition;
          this.clickDistanceFromEntity = {
            x: relativePosition.x - entity.position.x,
            y: relativePosition.y - entity.position.y,
          };
        } else {
          this.lastClickPosition = this.scene.mouseHandler.position;
          this.clickDistanceFromEntity = {
            x: this.scene.mouseHandler.position.x - entity.coords.boundingBox.x,
            y: this.scene.mouseHandler.position.y - entity.coords.boundingBox.y,
          };
        }

        this.boundingSelectionBox = getBoundingFromEntities(entities);
      },
    );

    this.scene.mouseHandler.onCanvas("mousedown", () => {
      this.boundingSelectionBox = null;
    });

    this.scene.mouseHandler.onCanvas("mousemove", () => {
      if (
        this.holdingEntity &&
        this.lastClickPosition &&
        this.clickDistanceFromEntity
      ) {
        const relativePosition = this.holdingEntity.getRelativePostion(
          this.scene.mouseHandler.position,
          true,
        );

        this.holdingEntity.position = {
          x: relativePosition.x - this.clickDistanceFromEntity.x,
          y: relativePosition.y - this.clickDistanceFromEntity.y,
        };
      }
    });

    this.scene.mouseHandler.onCanvas("mouseup", () => {
      this.clearMouseData();
    });
  }

  clearMouseData() {
    this.holdingEntity = null;
    this.lastClickPosition = null;
    this.clickDistanceFromEntity = null;
  }

  render(ctx: CanvasRenderingContext2D) {
    console.log(
      "rendering active selection plugin",
      ActiveSelectionManager.selectedEntities.size,
    );
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
