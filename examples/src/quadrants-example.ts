import { BaseEntity, Scene, SquareEntity } from "@palco-2d/core";
import { Vec2 } from "@palco-2d/core/types";
import { InfinityCanvasPlugin } from "@palco-2d/plugins";

const offset = 50;

export class QuadrantExamples extends Scene {
  private draggingEntity: BaseEntity | null;

  constructor(canvas: HTMLCanvasElement, name: string) {
    super(canvas, name);
    this.draggingEntity = null;
  }

  public async start() {
    // const createRect = (x: number, y: number) => {
    //   const rect = new SquareEntity({
    //     position: { x: x + offset, y: y + offset },
    //     size: { x: 25, y: 25 },
    //     rotation: 0,
    //   });
    //
    //   rect.on("mousehover", () => {
    //     rect.color = "red";
    //   });
    //
    //   rect.on("mouseleave", () => {
    //     rect.color = "#eab676";
    //   });
    //
    //   this.render.addEntity(rect);
    //   this.mouseHandler.addEntity(rect);
    // };
    //
    // for (let x = 0; x < 1300; x += 50) {
    //   for (let y = 0; y < 1300; y += 50) {
    //     createRect(x, y);
    //   }
    // }

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
      position: { x: 400, y: 400 },
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

    const coordDebug = () => {
      const coords = [
        {
          x: 813.9087296526011,
          y: 763.9087296526011,
        },
        {
          x: 813.9087296526011,
          y: 813.9087296526011,
        },
        {
          x: 763.9087296526011,
          y: 763.9087296526011,
        },
        {
          x: 763.9087296526011,
          y: 813.9087296526011,
        },
      ];

      for (const coord of coords) {
        const rect = new SquareEntity({
          position: coord,
          size: { x: 10, y: 10 },
          rotation: 0,
        });

        rect.color = "blue";

        this.render.addEntity(rect);
      }
    };

    coordDebug();

    const test = new SquareEntity({
      position: { x: 788, y: 788 },
      size: { x: 25, y: 25 },
      rotation: 0,
    });

    this.render.addEntity(test);

    this.addPlugin(new InfinityCanvasPlugin(this), "infinityCanvasPlugin");

    this.render.addEntity(square);
    this.mouseHandler.addEntity(square);

    this.render.startRender();
    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
