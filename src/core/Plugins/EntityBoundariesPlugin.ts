import { BaseEntity } from "../BaseEntity";
import { EntityPlugin } from "../EntityPlugin";
import { SceneHandler } from "../SceneHandler/SceneHandler";
import { WorldHandler } from "../WorldHandler";
import { BoundController, ControllerType } from "./BoundController";

const controllers: Array<ControllerType> = ["ml", "mt", "mb", "mr"];

export class EnityBoundariesPlugin extends EntityPlugin {
  constructor(entity: BaseEntity, key: string) {
    super(entity, key);
    this.addControllers();
  }

  private getPositionByType(type: ControllerType) {
    switch (type) {
      case "ml":
        return {
          x: this.entity.position.x - this.entity.size.x / 2,
          y: this.entity.position.y,
        };
      case "mt":
        return {
          x: this.entity.position.x,
          y: this.entity.position.y - this.entity.size.y / 2,
        };
      case "mb":
        return {
          x: this.entity.position.x,
          y: this.entity.position.y + this.entity.size.y / 2,
        };
      case "mr":
        return {
          x: this.entity.position.x + this.entity.size.x / 2,
          y: this.entity.position.y,
        };
    }
  }

  private getSizeByType(type: ControllerType) {
    switch (type) {
      case "ml":
      case "mr":
        return {
          x: 10,
          y: 50,
        };
      case "mt":
      case "mb":
        return {
          x: 50,
          y: 10,
        };
    }
  }

  private addControllers() {
    controllers.forEach((type) => {
      const position = this.getPositionByType(type);
      const size = this.getSizeByType(type);

      const controller = new BoundController({
        position: position,
        size: size,
        rotation: 0,
        type,
        connectedEntity: this.entity,
        layer: 999,
      });

      SceneHandler.currentScene?.render.addEntity(controller);
      SceneHandler.currentScene?.mouseHandler.addEntity(controller);
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    const { size } = this.entity;

    const zoom = WorldHandler().getZoom();

    ctx.strokeStyle = "#91AEC1";
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(-size.x / 2, -size.y / 2, size.x, size.y);
  }
}
