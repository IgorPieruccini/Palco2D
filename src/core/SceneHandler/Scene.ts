import { BaseEntity } from "../BaseEntity";
import { MouseHandler } from "../MouseHandler";
import { RenderHandler } from "../RenderHandler";
import { WorldHandler } from "../WorldHandler";

export class Scene {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public render: RenderHandler;
  public mouseHandler: MouseHandler;
  public world: ReturnType<typeof WorldHandler> = WorldHandler();
  private name: string;

  constructor(canvas: HTMLCanvasElement, name: string) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not found");
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

  public getEntityById(id: string, entities?: BaseEntity[]): BaseEntity | null {
    const searchableEntities = entities || this.render.entities;
    for (const entity of searchableEntities) {
      if (entity.id === id) {
        return entity;
      }

      if (entity.children?.length > 0) {
        const foundEntity = this.getEntityById(id, entity.children);
        if (foundEntity) {
          return foundEntity;
        }
      }
    }

    return null;
  }
}
