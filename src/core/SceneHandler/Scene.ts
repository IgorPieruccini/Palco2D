import { MouseHandler } from "../MouseHandler";
import { RenderHandler } from "../RenderHandler";

export class Scene {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public render: RenderHandler;
  public mouseHandler: MouseHandler;
  private name: string;

  constructor(canvas: HTMLCanvasElement, name: string) {
    this.canvas = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not found');
    }

    this.ctx = ctx;
    this.name = name;
    this.render = new RenderHandler(canvas, []);
    this.mouseHandler = new MouseHandler(canvas, []);
  }

  public getName() {
    return this.name;
  }

  public async start() { }

  public stop() {
    this.mouseHandler.stop();
    this.render.stopRender();
  }
}
