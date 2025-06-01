import { BaseEntity, Scene, ScenePlugin } from "@palco-2d/core";
import { Vec2 } from "@palco-2d/core/types";
import { ActiveSelectionManager } from "./ActiveSelectionManager";
import { RotateControl } from "./RotateControl";
import { getDistance } from "@palco-2d/core/src/utils";

/**
 * Listen to active selection and add the ability to move the selected entity(ies)
 * in the canvas with the mouse
 */
export class MoveEntityPlugin extends ScenePlugin {
  private holdingMouseRightClick: boolean = false;
  private onClickPosition: Vec2 | null = null;
  private distanceFromEntity: Array<Vec2> = [];

  // The entity responsible for rendering the rotate controller
   private rotateControl: RotateControl;

  constructor(scene: Scene) {
    super(scene);
    this.rotateControl = new RotateControl();
    this.scene.addEntity(this.rotateControl);
  }

  init() {
    this.scene.mouseHandler.onEntity("mousedown", this.onMouseDown.bind(this));
    this.scene.mouseHandler.onEntity("mouseup", this.onMouseUp.bind(this));
    this.scene.mouseHandler.onCanvas("mouseup", this.onMouseUp.bind(this));
    this.scene.mouseHandler.onCanvas("mousemove", this.onMouseMove.bind(this));
  }

  onMouseDown(entity: BaseEntity) {
    this.holdingMouseRightClick = true;
    this.onClickPosition = this.scene.mouseHandler.position;

    const selectedEntities = entity.isUI
      ? ActiveSelectionManager.selectedEntitiesUI
      : ActiveSelectionManager.selectedEntities;

    // Assign initial distance from each selected element
    selectedEntities.forEach((entity) => {
      const relativePosition = entity.getRelativePosition(
        this.scene.mouseHandler.position,
        true,
      );
      this.distanceFromEntity.push({
        x: relativePosition.x - entity.position.x,
        y: relativePosition.y - entity.position.y,
      });
    });
  }

  onMouseUp() {
    this.clearMouseData();
  }

  onMouseMove() {
    if (!this.running) return;
    const selectedEntities = ActiveSelectionManager.selectedEntities;

    if (
      this.holdingMouseRightClick &&
      this.onClickPosition &&
      this.distanceFromEntity.length > 0 &&
      selectedEntities.size > 0
    ) {

      // Add a threshold of 5px for moving
      if (getDistance(this.onClickPosition, this.scene.mouseHandler.position) < 5) {
        return
      }

      if (!this.rotateControl.hide) {
        this.rotateControl.hide = true;
      }

      const iterator = selectedEntities.entries();
      let iteratorResult = iterator.next();
      let index = 0;

      while (!iteratorResult.done) {
        const [_, entity] = iteratorResult.value;
        const relativePosition = entity.getRelativePosition(
          this.scene.mouseHandler.position,
          true,
        );

        entity.position = {
          x: relativePosition.x - this.distanceFromEntity[index].x,
          y: relativePosition.y - this.distanceFromEntity[index].y,
        };

        iteratorResult = iterator.next();
        index++;
      }
    }
  }

  onActiveSelectionUpdate(_: BaseEntity, entities: BaseEntity[]) {
    if (entities.length === 0) {
      this.clearMouseData();
      return;
    }

     this.rotateControl.hide = false;
  }

  protected onClearSelection(): void {
    console.log('clear')
    // this.rotateControl.hide = true;
  }

  clearMouseData() {
    this.holdingMouseRightClick = false;
    this.onClickPosition = null;
    this.distanceFromEntity = [];
    this.rotateControl.hide = false;
  }
}
