import { BaseEntity } from "../core/BaseEntity";
import { RenderHandler } from "../core/RenderHandler";
import { SquareEntity } from "../core/SquareEntity";

export default (canvas: HTMLCanvasElement) => {

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context not found');
  }

  const entities: BaseEntity[] = [];

  entities.push(new SquareEntity({
    position: { x: 10, y: 10 },
    size: { x: 100, y: 100 },
    rotation: 0
  }));

  entities.push(new SquareEntity({
    position: { x: 120, y: 10 },
    size: { x: 100, y: 100 },
    rotation: 0
  }));

  new RenderHandler(ctx, entities);
} 
