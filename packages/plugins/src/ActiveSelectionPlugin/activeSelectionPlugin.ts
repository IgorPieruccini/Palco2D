import { BaseEntity, ScenePlugin, WorldHandler } from "@palco-2d/core";
import { Vec2 } from "@palco-2d/core/types";

export class ActiveSelectionPlugin extends ScenePlugin {
  private holdingEntity: BaseEntity | null = null;
  private selectedEntities: Map<string, BaseEntity> = new Map();
  private lastClickPosition: Vec2 | null = null;
  private clickDistanceFromEntity: Vec2 | null = null;

  init() {
    this.scene.eventHandler.subscribeToSceneEvent("addEntity", (entity) => {
      entity.on("mousedown", () => {
        this.clearSelection();
        this.selectedEntities.set(entity.id, entity);
        this.holdingEntity = entity;
        this.lastClickPosition = this.scene.mouseHandler.position;
        this.clickDistanceFromEntity = {
          x: this.scene.mouseHandler.position.x - entity.coords.boundingBox.x,
          y: this.scene.mouseHandler.position.y - entity.coords.boundingBox.y,
        };
      });

      entity.on("mouseup", () => {
        this.clearMouseData();
      });
    });

    this.scene.mouseHandler.onCanvas("mousedown", () => {
      this.clearSelection();
      this.selectedEntities.clear();
    });

    this.scene.mouseHandler.onCanvas("mousemove", () => {
      if (
        this.holdingEntity &&
        this.lastClickPosition &&
        this.clickDistanceFromEntity
      ) {
        this.holdingEntity.position = {
          x:
            this.scene.mouseHandler.position.x - this.clickDistanceFromEntity.x,
          y:
            this.scene.mouseHandler.position.y - this.clickDistanceFromEntity.y,
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
