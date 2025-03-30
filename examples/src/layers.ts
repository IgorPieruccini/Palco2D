import { BaseEntity, Scene, SquareEntity } from "@palco-2d/core";
import { Vec2 } from "@palco-2d/core/types";

export class LayersExample extends Scene {
  public async start() {
    const NUMBER_OF_SQUARES = 16;
    const colors = [
      "#eab676",
      "#e0b2b2",
      "#d9b2e8",
      "#b2b2e8",
      "#b2e8d9",
      "#b2e8b2",
      "#e8d9b2",
      "#e8b2b2",
    ];

    let dragEntitiy: BaseEntity | null = null;

    const onDrag = (event: MouseEvent) => {
      const mousePosition: Vec2 = { x: event.clientX, y: event.clientY };
      if (dragEntitiy) {
        const relativePosition = dragEntitiy.getRelativePostion(
          mousePosition,
          true,
        );
        dragEntitiy.position = relativePosition;
      }
    };

    const addEntityEvents = (entity: SquareEntity) => {
      const originalColor = entity.color;
      entity.on("mouseenter", () => {
        if (!dragEntitiy) entity.color = "grey";
      });

      entity.on("mouseleave", () => {
        entity.color = originalColor;
      });

      entity.on("mousedown", () => {
        dragEntitiy = entity;
        this.canvas.addEventListener("mousemove", onDrag);
      });

      entity.on("mouseup", () => {
        this.canvas.removeEventListener("mousemove", onDrag);
        dragEntitiy = null;
      });
    };

    const entities: BaseEntity[] = [];

    for (let y = 0; y < NUMBER_OF_SQUARES; y++) {
      const layer = Math.floor(Math.sin(y) * 4) + 4;
      const originalSize: Vec2 = { x: 100, y: 100 };
      const aditionalSize = (20 * layer) / 2;
      const size: Vec2 = {
        x: originalSize.x + aditionalSize,
        y: originalSize.y + aditionalSize,
      };

      const square = new SquareEntity({
        position: { x: 50 * y, y: 50 * y },
        size,
        rotation: 90,
        layer,
      });

      const index = Math.floor((colors.length * y) / NUMBER_OF_SQUARES);
      square.color = colors[index];

      addEntityEvents(square);
      entities.push(square);
    }

    this.addEntities(entities);

    this.render.startRender();
    this.mouseHandler.start();
  }
}
