import { BaseEntity, Scene, SceneHandler, WorldHandler } from "@palco-2d/core";
import { getBoundingFromEntities } from "@palco-2d/core/src/utils";
import { Vec2 } from "@palco-2d/core/types";
import { ActiveSelectionManager } from "./ActiveSelectionManager";

const SIZE: Vec2 = {
  x: 30,
  y: 30,
};

export class RotateControl extends BaseEntity {

  public isRotating: boolean = false;
  private scene: Scene;

  private _hide: boolean = true;
  public set hide(hide: boolean) {
    this.setStatic(hide)
    this._hide = hide;

    if (!hide) {
      const selectedEntities = ActiveSelectionManager.selectedEntities;
      if (selectedEntities.size === 0) return;
      const entitiesArray = Array.from(selectedEntities.values());
      const entitiesBounds = getBoundingFromEntities(entitiesArray);

      this.position = {
        x: entitiesBounds.x + entitiesBounds.width / 2,
        y: entitiesBounds.y + entitiesBounds.height + SIZE.y
      }
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
    console.log("add addListener")
    this.on('mousedown',this.onMouseDown.bind(this) )
    this.on('mouseup', this.onMouseUp.bind(this))
    this.scene.mouseHandler.onCanvas('mouseup', this.onMouseUp.bind(this));
  }

  private onMouseDown() {
    console.log('onMouseDown')
    this.isRotating = true;
    this.scene.getPlugin("moveEntity").stop();

  }

  private onMouseUp() {
    if(this.isRotating){
      console.log("onMouseUp");
      this.isRotating = false;
      this.scene.getPlugin("moveEntity").start()
    }
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
  }
}
