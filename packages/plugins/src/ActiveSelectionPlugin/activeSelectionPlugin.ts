import { BaseEntity, ScenePlugin, WorldHandler } from "@palco-2d/core";
import { BoundingBox, Vec2 } from "@palco-2d/core/types";
import { getBoundingFromEntities } from "@palco-2d/core/src/utils";

export class ActiveSelectionPlugin extends ScenePlugin {
  private holdingEntity: BaseEntity | null = null;
  private selectedEntities: Map<string, BaseEntity> = new Map();
  private lastClickPosition: Vec2 | null = null;
  private clickDistanceFromEntity: Vec2 | null = null;
  private pressingShift: boolean = false;
  private boundingSelectionBox: BoundingBox | null = null;

  init() {
    this.scene.eventHandler.subscribeToSceneEvent("addEntity", (entity) => {
      entity.on("mousedown", () => {
        if (!this.pressingShift) {
          this.clearSelection();
        }
        this.selectedEntities.set(entity.id, entity);
        this.holdingEntity = entity;
        this.lastClickPosition = this.scene.mouseHandler.position;
        this.clickDistanceFromEntity = {
          x: this.scene.mouseHandler.position.x - entity.coords.boundingBox.x,
          y: this.scene.mouseHandler.position.y - entity.coords.boundingBox.y,
        };

        this.boundingSelectionBox = getBoundingFromEntities(
          Array.from(this.selectedEntities.values()),
        );
      });

      entity.on("mouseup", () => {
        this.clearMouseData();
      });
    });

    this.scene.eventHandler.subscribeToSceneEvent("addChild", (entity) => {
      entity.on("mousedown", () => {
        if (!this.pressingShift) {
          this.clearSelection();
        }
        this.selectedEntities.set(entity.id, entity);
        this.holdingEntity = entity;

        const relativePosition = entity.getRelativePostion(
          this.scene.mouseHandler.position,
          true,
        );

        this.lastClickPosition = relativePosition;
        this.clickDistanceFromEntity = {
          x: relativePosition.x - entity.position.x,
          y: relativePosition.y - entity.position.y,
        };

        this.boundingSelectionBox = getBoundingFromEntities(
          Array.from(this.selectedEntities.values()),
        );
      });

      entity.on("mouseup", () => {
        this.clearMouseData();
      });
    });

    this.scene.mouseHandler.onCanvas("mousedown", () => {
      this.clearSelection();
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

    this.listenToKeyboardEvents();
  }

  clearMouseData() {
    this.holdingEntity = null;
    this.lastClickPosition = null;
    this.clickDistanceFromEntity = null;
  }

  clearSelection() {
    this.selectedEntities.clear();
  }

  listenToKeyboardEvents() {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        this.pressingShift = true;
      }
    });

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        this.pressingShift = false;
      }
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    this.selectedEntities.forEach((entity) => {
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

    if (this.selectedEntities.size > 1 && this.boundingSelectionBox) {
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
