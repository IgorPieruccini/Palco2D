import { BaseEntity, ScenePlugin } from "@palco-2d/core";
import { getBoundingFromEntities, getPositionFromMatrix, getRadFromMatrix, rotateAround } from "@palco-2d/core/src/utils";
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
  private initialAngle: number | null = 0;

  // Store the initial matrix of all selected entities before rotation starts
  // to aid calculating the delta angle
  private initialEntitiesMatrix: Map<string, number[][]> = new Map();

  private initialControlMatrix: number[][] = [];

  init() {
    this.control = new RotateControl();
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
      this.initialAngle = null;
      this.initialControlMatrix = this.control.matrix;
      ActiveSelectionManager.selectedEntities.forEach(entity => {
        this.initialEntitiesMatrix.set(entity.id, entity.matrix);
      });

      // Stop move entity to prevent moving the element while rotating
      this.scene.getPlugin("moveEntity").stop();

      this.scene.canvas.addEventListener("mouseup", this.onMouseUp.bind(this))
    });
  }

  private onMouseUp() {
    this.isRotating = false;
    this.initialEntitiesMatrix.clear()
    // TODO: what if the moveEntity does not exist?
    this.scene.getPlugin("moveEntity").start();
    this.scene.canvas.removeEventListener("mouseup", this.onMouseUp.bind(this))
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

    // Calculate the radian angle between the mouse position and the center of the selection in radians
    const rad = Math.atan2(
      this.scene.mouseHandler.position.y - center.y,
      this.scene.mouseHandler.position.x - center.x,
    );

    const angle = rad * (180 / Math.PI);

    // to aid calculate the delta
    if (this.initialAngle === null) {
      this.initialAngle = rad * (180 / Math.PI);
    }

    const deltaAngle = angle - this.initialAngle;

    ActiveSelectionManager.selectedEntities.forEach((entity) => {
      if (!this.currentSelectionBound) return;

      const initialMatrix = this.initialEntitiesMatrix.get(entity.id);
      if (!initialMatrix) return;

      const initialPosition = getPositionFromMatrix(initialMatrix);
      const initialRad = getRadFromMatrix(initialMatrix);
      const initialAngle = initialRad * (180 / Math.PI);

      const position = rotateAround(initialPosition, center, deltaAngle * Math.PI / 180);

      const initialControlPosition = getPositionFromMatrix(this.initialControlMatrix);
      const controlPosition = rotateAround(initialControlPosition, center, deltaAngle * Math.PI / 180)

      entity.rotation = deltaAngle + initialAngle;
      entity.position = position;

      this.control.position = controlPosition;
    });
  }

  render() {
    if(this.isRotating) {
      this.handleEntityRotation();
    }
  }
}
