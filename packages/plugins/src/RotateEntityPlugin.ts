import { BaseEntity, ScenePlugin } from "@palco-2d/core";
import { getBoundingFromEntities } from "@palco-2d/core/src/utils";
import { BoundingBox } from "@palco-2d/core/types";
import { ActiveSelectionManager } from "./ActiveSelectionManager";
import { RotateControl } from "./RotateControl";

export class RotateEntityPlugin extends ScenePlugin {
  private currentSelectionBound: BoundingBox | null = null;
  private control = new RotateControl();

  init() {
    this.scene.mouseHandler.onCanvas("mousemove", this.onMouseMove.bind(this));
    this.control = new RotateControl();
    console.log(this.control.isUI);
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
        console.log("Rotate control clicked");
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
