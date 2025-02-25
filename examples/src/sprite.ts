import { Scene, AssetHandler, Sprite } from "@palco-2d/core";
import { InfinityCanvasPlugin } from "@palco-2d/plugins";

export class SpriteExample extends Scene {
  public async start() {
    await AssetHandler().loadPng("assets/ninja-frog-jump.png");
    await AssetHandler().loadTileMap("assets/ninja-frog-run.tilemap.json");

    const createFrogs = () => {
      for (let x = 0; x < 7000; x++) {
        const frog = new Sprite({
          texture: "assets/ninja-frog-jump.png",
          position: {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
          },
          rotation: 0,
        });

        frog.size = { x: 64, y: 54 };

        frog.on("mouseenter", () => {
          frog.size = { x: frog.size.x + 10, y: frog.size.y + 10 };
        });

        frog.on("mouseleave", () => {
          frog.size = { x: frog.size.x - 10, y: frog.size.y - 10 };
        });

        this.render.addEntity(frog);
      }
    };

    createFrogs();

    this.addPlugin(new InfinityCanvasPlugin(this), "infinityCanvasPlugin");
    this.mouseHandler.start();
    this.render.startRender();
    this.startAllPlugins();
  }
}
