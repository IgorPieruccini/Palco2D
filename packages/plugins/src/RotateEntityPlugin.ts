import { BaseEntity, ScenePlugin } from "@palco-2d/core";
import { getBoundingFromEntities } from "@palco-2d/core/src/utils";
import { BoundingBox } from "@palco-2d/core/types";
import { ActiveSelectionManager } from "./ActiveSelectionManager";
import { RotateControl } from "./RotateControl";
import { ActiveSelectionPlugin } from "./ActiveSelectionPlugin/activeSelectionPlugin";


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

  // Store the initial entity of all selected entities,
  // to start the rotation from the initial rotation of the entity
  private initialEntitiesRotation: Map<string, number> = new Map();

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
      this.addControllerListeners();
    }

    this.updatePosition();
  }

  private addControllerListeners() {
    this.control.on("mousedown", () => {
      this.isRotating = true;
      this.initialAngle = null;
      ActiveSelectionManager.selectedEntities.forEach(entity => {
        this.initialEntitiesRotation.set(entity.id, entity.rotation);
      });

      // Stop move entity to prevent moving the element while rotating
      this.scene.getPlugin("moveEntity").stop();

      // ### Add event listeners to identify when the user stops to rotate the entity ###
      //TODO:  Get event ID to unsubscribe
      this.scene.mouseHandler.onCanvas("mouseup", () => {
        this.isRotating = false;
        this.initialEntitiesRotation.clear()
        // TODO: what if the moveEntity does not exist?
        this.scene.getPlugin("moveEntity").start();
      });

      this.scene.mouseHandler.onEntity("mouseup", () => {
        this.isRotating = false;
        this.initialEntitiesRotation.clear()
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

    const rad = Math.atan2(
      this.scene.mouseHandler.position.y - center.y,
      this.scene.mouseHandler.position.x - center.x,
    );

    const angle = rad * (180 / Math.PI);

    // Assign the delta angle only on the first iteration of initialRotation
    // to aid calculate the delta
    if (this.initialAngle === null) {
      this.initialAngle = angle;
    }

    const delta = angle - this.initialAngle;

    // THIS IS WRONG BECAUSE DOES NOT CONSIDER THE TRANSFORM OF EACH INDIVIDUAL ENTITY
    // BUT IS OK FOR TESTING PURPOSES (AT LEAST FOR NOW)
    ActiveSelectionManager.selectedEntities.forEach((entity) => {
      const initialRotation = this.initialEntitiesRotation.get(entity.id) || 0;
      entity.rotation = delta + initialRotation;
    });
  }

  render() {
    if(this.isRotating) {
      this.handleEntityRotation();
    }
  }
}
