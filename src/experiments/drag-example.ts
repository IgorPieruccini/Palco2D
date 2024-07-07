import { BaseEntity } from "../core/BaseEntity";
import { MouseHandler } from "../core/MouseHandler";
import { RenderHandler } from "../core/RenderHandler";
import { SquareEntity } from "../core/SquareEntity";
import { Vec2 } from "../core/types";

export default (canvas: HTMLCanvasElement) => {

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context not found');
  }

  let dragEntitiy: BaseEntity | null = null;

  const onDrag = (event: MouseEvent) => {
    const mousePosition: Vec2 = { x: event.clientX, y: event.clientY };
    if (dragEntitiy) {
      const relativePosition = dragEntitiy.getRelativePostion(mousePosition, true);
      dragEntitiy.position = relativePosition;
    }
  };

  const addEntityEvents = (entity: BaseEntity) => {
    const originalSize = entity.size;
    entity.on('mousehover', () => {
      // entity.rotation += 1;
    });

    entity.on('mouseenter', () => {
      entity.size = { x: originalSize.x + 10, y: originalSize.y + 10 };
    });

    entity.on('mouseleave', () => {
      entity.size = originalSize;
    });

    entity.on('mousedown', () => {
      dragEntitiy = entity;
      canvas.addEventListener('mousemove', onDrag);
    });

    entity.on('mouseup', () => {
      canvas.removeEventListener('mousemove', onDrag);
      dragEntitiy = null;
    });
  }

  const parent = new SquareEntity({
    position: { x: 300, y: 300 },
    size: { x: 100, y: 100 },
    rotation: 45,
  });

  parent.size = { x: 150, y: 150 };

  addEntityEvents(parent);

  const child = new SquareEntity({
    id: 100,
    position: { x: 200, y: 0 },
    size: { x: 50, y: 50 },
    rotation: 0,
  });

  addEntityEvents(child);

  const secondChild = new SquareEntity({
    id: 111,
    position: { x: 100, y: 0 },
    size: { x: 50, y: 100 },
    rotation: 0,
  });

  addEntityEvents(secondChild);


  parent.addChild(child);
  child.addChild(secondChild);

  const entities = [parent];

  new MouseHandler(canvas, entities);
  new RenderHandler(ctx, entities);
} 
