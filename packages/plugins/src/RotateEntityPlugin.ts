import { BaseEntity, ScenePlugin } from "@palco-2d/core";
import { getBoundingFromEntities, getPositionFromMatrix, rotateAround } from "@palco-2d/core/src/utils";
import { BoundingBox, Vec2 } from "@palco-2d/core/types";
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

  // True if the user is rotating the selected entities
  private isRotating = false;

  // Set on first iteration of the rotation, to help calculating the delta angle
  private initialRad: number | null = 0;

  // Store the initial matrix of all selected entities before rotation starts
  // to aid calculating the delta angle
  private initialEntitiesMatrix: Map<string, number[][]> = new Map();

  init() {
    this.scene.mouseHandler.onCanvas("mousemove", this.onMouseMove.bind(this));
    this.control = new RotateControl();
  }

  private onMouseMove() {
    if (
      !this.isRotating &&
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
      this.addControllerListeners();
    }

    this.updatePosition();
  }

  private addControllerListeners() {
    this.control.on("mousedown", () => {
      this.isRotating = true;
      this.initialRad = null;
      ActiveSelectionManager.selectedEntities.forEach(entity => {
        this.initialEntitiesMatrix.set(entity.id, entity.matrix);
      });

      // Stop move entity to prevent moving the element while rotating
      this.scene.getPlugin("moveEntity").stop();

      // ### Add event listeners to identify when the user stops to rotate the entity ###
      //TODO:  Get event ID to unsubscribe
      this.scene.mouseHandler.onCanvas("mouseup", () => {
        this.isRotating = false;
        this.initialEntitiesMatrix.clear()
        // TODO: what if the moveEntity does not exist?
        this.scene.getPlugin("moveEntity").start();
      });

      this.scene.mouseHandler.onEntity("mouseup", () => {
        this.isRotating = false;
        this.initialEntitiesMatrix.clear()
        // TODO: what if the moveEntity does not exist?
        this.scene.getPlugin("moveEntity").start();
      });
    });
  }

  protected onClearSelection(): void {
    if (this.scene.render.getEntityByAddress(this.control.getIdAdress())) {
      this.scene.removeEntity(this.control);
    }
  }

  private handleEntityRotation() {
    if (!this.currentSelectionBound) return;

    const center = {
      x: this.currentSelectionBound.x + this.currentSelectionBound.width / 2,
      y: this.currentSelectionBound.y + this.currentSelectionBound.height / 2,
    };

    // console.log(center)

    // Calculate the radian angle between the mouse position and the center of the selection in radians
    const rad = Math.atan2(
      this.scene.mouseHandler.position.y - center.y,
      this.scene.mouseHandler.position.x - center.x,
    );

    // to aid calculate the delta
    if (this.initialRad === null) {
      this.initialRad = rad;
    }

    const deltaAngle = rad * (180 / Math.PI) - this.initialRad * (180 / Math.PI);

    ActiveSelectionManager.selectedEntities.forEach((entity) => {
      if (!this.currentSelectionBound) return;

      const initialMatrix = this.initialEntitiesMatrix.get(entity.id);
      if (!initialMatrix) return;

      const initialPosition = getPositionFromMatrix(initialMatrix);
      const position = rotateAround(initialPosition, center, deltaAngle * Math.PI / 180);

      entity.rotation = deltaAngle;
      entity.position = position;
    });
  }

  render() {
    if(this.isRotating) {
      this.handleEntityRotation();
    }
  }
}
