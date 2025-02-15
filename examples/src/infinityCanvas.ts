import { BaseEntity, Scene, SquareEntity } from "@palco-2d/core";
import { FPSViewPlugin, InfinityCanvasPlugin } from "@palco-2d/plugins";

export class InvitiyCanvasSceneExample extends Scene {
  public async start() {
    const entities: BaseEntity[] = [];

    let x = 0;
    let y = 0;
    for (let i = 0; i < 1000; i++) {
      const square = new SquareEntity({
        position: { x, y },
        size: { x: 50, y: 50 },
        rotation: 0,
        color: "#3C1518",
      });

      x += 80;
      if (i % 33 === 0) {
        x = 0;
        y += 80;
      }

      square.on("mouseenter", () => {
        square.color = "#FFC300";
      });

      square.on("mouseleave", () => {
        square.color = "#3C1518";
      });

      entities.push(square);
    }

    const square = new SquareEntity({
      position: { x: 200, y: 0 },
      size: { x: 50, y: 50 },
      rotation: 0,
      color: "blue",
    });

    const square2 = new SquareEntity({
      position: { x: 200, y: 0 },
      size: { x: 50, y: 50 },
      rotation: 0,
      color: "yellow",
    });

    square.addChild(square2);
    square.on("mouseenter", () => {
      square.color = "red";
    });

    square.on("mouseleave", () => {
      square.color = "blue";
    });

    square2.on("mouseenter", () => {
      square2.color = "red";
    });

    square2.on("mouseleave", () => {
      square2.color = "yellow";
    });

    entities[0].addChild(square);

    this.addPlugin(new InfinityCanvasPlugin(this), "infinityCanvas");
    this.addPlugin(new FPSViewPlugin(this), "fpsView");
    this.render.addEntities(entities);
    this.mouseHandler.addEntities(entities);

    this.startAllPlugins();
    this.render.startRender();
    this.mouseHandler.start();
  }
}
