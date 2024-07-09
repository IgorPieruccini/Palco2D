
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


  new MouseHandler(canvas, []);
  new RenderHandler(ctx, []);
} 
