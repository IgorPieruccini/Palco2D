import {
  BaseEntity,
  EntityPlugin,
  SceneHandler,
  WorldHandler,
} from "@palco-2d/core";
import { TransformController } from "./TransformController/TransformController";
import { ControllerType } from "./TransformController/type";
import { transformControllerUtils } from "./TransformController/utils";

const controllers: Array<ControllerType> = ["ml", "mt", "mb", "mr"];
const CONTROLLER_SIZE_MAP: Record<ControllerType, { x: number; y: number }> = {
  ml: { x: 10, y: 50 },
  mt: { x: 50, y: 10 },
  mb: { x: 50, y: 10 },
  mr: { x: 10, y: 50 },
};

export class TransformerEntityController extends EntityPlugin {
  controllers: Partial<Record<ControllerType, TransformController>> = {};

  constructor(entity: BaseEntity, key: string) {
    super(entity, key);
    this.addControllers();
  }

  private onControllerUpdate() {
    Object.entries(this.controllers).forEach(([key, controller]) => {
      if (!controller) return;
      controller.position =
        transformControllerUtils.getControllerPositionBasedOnBounds(
          controller.connectedEntity,
          key as ControllerType,
        );
    });
  }

  private addControllers() {
    controllers.forEach((type) => {
      const position =
        transformControllerUtils.getControllerPositionBasedOnBounds(
          this.entity,
          type,
        );

      const size = CONTROLLER_SIZE_MAP[type];

      const controller = new TransformController({
        position: position,
        size: size,
        rotation: 0,
        type,
        connectedEntity: this.entity,
        onUpdatePosition: this.onControllerUpdate.bind(this),
        layer: 999,
      });

      SceneHandler.currentScene?.render.addEntity(controller);
      this.controllers[type] = controller;
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    const { size } = this.entity;

    const zoom = WorldHandler.getZoom();

    ctx.strokeStyle = "#91AEC1";
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(-size.x / 2, -size.y / 2, size.x, size.y);
  }

  destroy() {
    const entityControllers = Object.values(this.controllers);

    for (const controler of entityControllers) {
      SceneHandler.currentScene?.render.removeEntityByAdress(
        controler.getIdAdress(),
      );
      SceneHandler.currentScene.mouseHandler.removeEntity(controler);
    }

    this.controllers = {};
  }
}
