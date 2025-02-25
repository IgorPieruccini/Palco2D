import { BaseEntity, Scene, SquareEntity } from "@palco-2d/core";
import { Vec2 } from "@palco-2d/core/types";

export class DragExample extends Scene {
  public async start() {
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

    const addEntityEvents = (entity: BaseEntity) => {
      const originalSize = entity.size;
      entity.on("mousehover", () => {
        entity.rotation += 1;
      });

      entity.on("mouseenter", () => {
        entity.size = { x: originalSize.x + 10, y: originalSize.y + 10 };
      });

      entity.on("mouseleave", () => {
        entity.size = originalSize;
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

    const parent = new SquareEntity({
      id: "parent",
      position: { x: 300, y: 300 },
      size: { x: 100, y: 100 },
      rotation: 45,
    });

    addEntityEvents(parent);

    const child = new SquareEntity({
      id: "firstChild",
      position: { x: 200, y: 0 },
      size: { x: 50, y: 50 },
      rotation: 0,
    });

    addEntityEvents(child);

    const secondChild = new SquareEntity({
      id: "secondChild",
      position: { x: 100, y: 0 },
      size: { x: 50, y: 100 },
      rotation: 90,
    });

    addEntityEvents(secondChild);

    parent.addChild(child);
    child.addChild(secondChild);

    const entities = [parent];

    this.render.addEntities(entities);
    this.render.startRender();
    this.mouseHandler.start();
  }
}
