import { Scene, AssetHandler, Sprite } from "@palco-2d/core";

export class TileMapExample extends Scene {
  public async start() {
    await AssetHandler.loadPng("assets/ninja-frog-run.png");
    await AssetHandler.loadTileMap("assets/ninja-frog-run.tilemap.json");

    const createFrogs = () => {
      for (let x = 0; x < 100; x++) {
        const frog = new Sprite({
          texture: "assets/ninja-frog-run.png",
          position: {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
          },
          rotation: 0,
          tileMap: "assets/ninja-frog-run.tilemap.json",
        });

        const speed = 0.2 + Math.random() * 2;
        frog.animation?.setUpdateCadence(speed);
        frog.animation?.start();

        frog.on("mouseenter", () => {
          frog.animation?.stop();
        });

        this.addEntity(frog);
      }
    };

    createFrogs();

    this.render.startRender();
    this.mouseHandler.start();
  }
}
