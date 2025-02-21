import { Scene, SquareEntity } from "@palco-2d/core";

export class QuadrantExamples extends Scene {
  public async start() {
    const rect = new SquareEntity({
      position: { x: 100, y: 100 },
      size: { x: 100, y: 100 },
      rotation: 0,
    });

    this.render.addEntity(rect);
    this.render.startRender();

    this.mouseHandler.addEntity(rect);
    this.mouseHandler.start();
  }
}
