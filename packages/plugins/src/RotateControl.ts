import { BaseEntity, Scene, SceneHandler, WorldHandler } from "@palco-2d/core";
import { BoundingBox, Vec2 } from "@palco-2d/core/types";
import { ActiveSelectionManager } from "./ActiveSelectionManager";
import {
  getBoundingFromEntities,
  getPositionFromMatrix,
  getRadFromMatrix,
  rotateAround,
} from "@palco-2d/core/src/utils";

const SIZE: Vec2 = {
  x: 30,
  y: 30,
};

export class RotateControl extends BaseEntity {
  public isRotating: boolean = false;
  private startedToRotate: boolean = false;
  private scene: Scene;
  private _bounds: BoundingBox | null = null;
  private _initialAngle: number | null = null;

  // Store the initial matrix of all selected entities before rotation starts
  // to aid calculating the delta angle
  private initialEntitiesMatrix: Map<string, number[][]> = new Map();
  private initialControlMatrix: number[][] = [];

  private _hide: boolean = true;
  public set hide(hide: boolean) {
    this.setStatic(hide);
    this._hide = hide;

    if (!hide) {
      const selectedEntities = ActiveSelectionManager.selectedEntities;
      if (selectedEntities.size === 0 || this.startedToRotate) return;

      selectedEntities.forEach((entity) => {
        this.initialEntitiesMatrix.set(entity.id, entity.matrix);
      });
      const entitiesArray = Array.from(selectedEntities.values());
      const entitiesBounds = getBoundingFromEntities(entitiesArray);
      this._bounds = entitiesBounds;

      this.position = {
        x: entitiesBounds.x + entitiesBounds.width / 2,
        y: entitiesBounds.y + entitiesBounds.height + SIZE.y,
      };

      this.initialControlMatrix = this.matrix;
    } else {
      this.initialEntitiesMatrix.clear();
      this.startedToRotate = false;
    }
  }
  public get hide() {
    return this._hide;
  }

  constructor() {
    super({
      id: "rotateControl",
      position: { x: 0, y: 0 },
      size: SIZE,
      rotation: 0,
      isUI: true,
    });

    this.scene = SceneHandler.currentScene;
    this.addListener();
  }

  public addListener() {
    this.on("mousedown", this.onMouseDown.bind(this));
    this.on("mouseup", this.onMouseUp.bind(this));
    this.scene.mouseHandler.onCanvas("mouseup", this.onMouseUp.bind(this));
    this.scene.mouseHandler.onEntity("mouseup", this.onMouseUp.bind(this));
  }

  private onMouseDown() {
    console.log("onMouseDown");
    this.isRotating = true;
    this.scene.getPlugin("moveEntity").stop();
  }

  private onMouseUp() {
    if (this.isRotating) {
      console.log("onMouseUp");
      this.isRotating = false;
      this.scene.getPlugin("moveEntity").start();
    }
  }

  private handleRotate() {
    if (!this._bounds) {
      return;
    }

    this.startedToRotate = true;

    const center = {
      x: this._bounds.x + this._bounds.width / 2,
      y: this._bounds.y + this._bounds.height / 2,
    };

    // Calculate the radian angle between the mouse position and the center of the selection in radians
    const rad = Math.atan2(
      this.scene.mouseHandler.position.y - center.y,
      this.scene.mouseHandler.position.x - center.x,
    );

    const angle = rad * (180 / Math.PI);

    // To aid calculate the delta
    if (this._initialAngle === null) {
      this._initialAngle = rad * (180 / Math.PI);
    }

    const deltaAngle = angle - this._initialAngle;

    ActiveSelectionManager.selectedEntities.forEach((entity) => {
      const initialMatrix = this.initialEntitiesMatrix.get(entity.id);
      if (!initialMatrix) return;

      const initialPosition = getPositionFromMatrix(initialMatrix);
      const initialRad = getRadFromMatrix(initialMatrix);
      const initialAngle = initialRad * (180 / Math.PI);

      const position = rotateAround(
        initialPosition,
        center,
        (deltaAngle * Math.PI) / 180,
      );

      const initialControlPosition = getPositionFromMatrix(
        this.initialControlMatrix,
      );
      const controlPosition = rotateAround(
        initialControlPosition,
        center,
        (deltaAngle * Math.PI) / 180,
      );

      entity.rotation = deltaAngle + initialAngle;
      entity.position = position;

      this.position = controlPosition;
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);

    if (this._hide) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1 / WorldHandler.getZoom();
    ctx.fillStyle = "red";
    ctx.strokeRect(-SIZE.x / 2, -SIZE.y / 2, SIZE.x, SIZE.y);
    ctx.restore();

    if (this.isRotating) {
      this.handleRotate();
    }
  }
}
