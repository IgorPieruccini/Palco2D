import { Scene, SquareEntity } from "@palco-2d/core";

const offset = 50;

export class QuadrantExamples extends Scene {
  public async start() {
    const createRect = (x: number, y: number) => {
      const rect = new SquareEntity({
        position: { x: x + offset, y: y + offset },
        size: { x: 25, y: 25 },
        rotation: 0,
      });

      rect.on("mousehover", () => {
        rect.color = "red";
      });

      rect.on("mouseleave", () => {
        rect.color = "#eab676";
      });

      this.render.addEntity(rect);
      this.mouseHandler.addEntity(rect);
    };

    for (let x = 0; x < 1300; x += 50) {
      for (let y = 0; y < 1300; y += 50) {
        createRect(x, y);
      }
    }

    this.render.startRender();
    this.mouseHandler.start();
  }
}
