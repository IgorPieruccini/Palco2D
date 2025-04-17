import { BaseEntity, ScenePlugin } from "@palco-2d/core";
import { getBoundingFromEntities } from "@palco-2d/core/src/utils";
import { BoundingBox } from "@palco-2d/core/types";
import { ActiveSelectionManager } from "./ActiveSelectionManager";
import { RotateControl } from "./RotateControl";


/**
* Renders rotation controllers and the logic to rotate the selected entities
*/
export class RotateEntityPlugin extends ScenePlugin {
  // The current bounds of the selected entities, used to calculate where to render the rotate controller
  private currentSelectionBound: BoundingBox | null = null;
  // The entity responsible for rendering the rotate controller
  private control = new RotateControl();

  init() {
    this.scene.mouseHandler.onCanvas("mousemove", this.onMouseMove.bind(this));
    this.control = new RotateControl();
  }

  private onMouseMove() {
    if (
      this.currentSelectionBound &&
      ActiveSelectionManager.selectedEntities.size > 0
    ) {
      this.currentSelectionBound = getBoundingFromEntities(
        Array.from(ActiveSelectionManager.selectedEntities.values()),
      );
      this.updatePosition();
    }
  }

  private updatePosition() {
    if (this.currentSelectionBound) {
      this.control.position = {
        x: this.currentSelectionBound.x + this.currentSelectionBound.width / 2,
        y:
          this.currentSelectionBound.y +
          this.currentSelectionBound.height +
          this.control.size.y,
      };
    }
  }

  protected onActiveSelectionUpdate(
    _: BaseEntity,
    entities: BaseEntity[],
  ): void {
    this.currentSelectionBound = getBoundingFromEntities(entities);

    if (!this.scene.render.getEntityByAddress(this.control.getIdAdress())) {
      this.scene.addEntity(this.control);

      this.control.on("mousedown", () => {
        this.scene.getPlugin("moveEntity").stop();

        //TODO:  Get event ID to unsubscribe
        this.scene.mouseHandler.onCanvas("mouseup", () => {
          this.scene.getPlugin("moveEntity").start();
        });

        this.scene.mouseHandler.onEntity("mouseup", () => {
          this.scene.getPlugin("moveEntity").start();
        });
      });
    }

    this.updatePosition();
  }

  protected onClearSelection(): void {
    if (this.scene.render.getEntityByAddress(this.control.getIdAdress())) {
      this.scene.removeEntity(this.control);
    }
  }
}
