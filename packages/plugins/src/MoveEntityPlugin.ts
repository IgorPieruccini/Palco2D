import { BaseEntity, ScenePlugin } from "@palco-2d/core";
import { Vec2 } from "@palco-2d/core/types";

/**
 * Listen to active selection and add the ability to move the selected entity(ies)
 * in the canvas with the mouse
 */
export class MoveEntityPlugin extends ScenePlugin {
  private holdingEntity: BaseEntity | null = null;
  private lastClickPosition: Vec2 | null = null;
  private clickDistanceFromEntity: Vec2 | null = null;

  init() {
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

  onActiveSelectionUpdate(entity: BaseEntity, entities: BaseEntity[]) {
    if (entities.length === 0) {
      this.clearMouseData();
      return;
    }

    this.holdingEntity = entity;

    entity.on("mouseup", () => {
      if (this.holdingEntity) {
        this.holdingEntity = null;
      }
    });

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
  }

  clearMouseData() {
    this.holdingEntity = null;
    this.lastClickPosition = null;
    this.clickDistanceFromEntity = null;
  }
}
