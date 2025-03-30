import { BaseEntity, Scene, SquareEntity } from "@palco-2d/core";
import { Vec2 } from "@palco-2d/core/types";
import { InfinityCanvasPlugin } from "@palco-2d/plugins";

export class QuadrantExamples extends Scene {
  private draggingEntity: BaseEntity | null;

  constructor() {
    super();
    this.draggingEntity = null;
  }

  public async start() {
    const addEvents = (entity: SquareEntity) => {
      entity.on("mouseenter", () => {
        entity.color = "red";
      });

      entity.on("mouseleave", () => {
        entity.color = "#eab676";
      });

      entity.on("mousedown", () => {
        this.draggingEntity = entity;
      });

      entity.on("mouseup", () => {
        this.draggingEntity = null;
      });
    };

    const square = new SquareEntity({
      id: "square",
      position: { x: 500, y: 700 },
      size: { x: 100, y: 100 },
      rotation: 45,
    });

    const childSquare = new SquareEntity({
      id: "childSquare",
      position: { x: 550, y: 0 },
      size: { x: 50, y: 50 },
      rotation: 45,
    });

    const secondChildSquare = new SquareEntity({
      id: "secondChildSquare",
      position: { x: 0, y: 300 },
      size: { x: 50, y: 50 },
      rotation: 45,
    });

    addEvents(square);
    addEvents(childSquare);
    addEvents(secondChildSquare);

    const rect1 = new SquareEntity({
      id: "rect1",
      position: { x: 305, y: 305 },
      size: { x: 610, y: 610 },
      rotation: 45,
    });

    addEvents(rect1);

    this.canvas.addEventListener("mousemove", (event) => {
      const mousePosition: Vec2 = { x: event.clientX, y: event.clientY };
      if (this.draggingEntity) {
        if (this.draggingEntity) {
          const relativePosition = this.draggingEntity.getRelativePostion(
            mousePosition,
            true,
          );
          this.draggingEntity.position = relativePosition;
        }
      }
    });

    square.addChild(childSquare);
    childSquare.addChild(secondChildSquare);

    this.addPlugin(InfinityCanvasPlugin, "infinityCanvas");

    this.addEntity(square);
    this.addEntity(rect1);

    this.render.startRender();
    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
