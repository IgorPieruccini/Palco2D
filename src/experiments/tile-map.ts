import { AssetHandler } from "../core/AssetHandler";
import { Scene } from "../core/SceneHandler/Scene";
import { Sprite } from "../core/Sprite";

export class TileMapExample extends Scene {
  public async start() {
    await AssetHandler().loadPng("assets/ninja-frog-run.png");
    await AssetHandler().loadTileMap("assets/ninja-frog-run.tilemap.json");

    const createFrogs = () => {
      for (let x = 0; x < 500; x++) {
        const frog = new Sprite({
          texture: "assets/ninja-frog-run.png",
          position: {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
          },
          rotation: 0,
          tileMap: "assets/ninja-frog-run.tilemap.json",
        });

        const speed = 2 + Math.random() * 2;
        frog.animation?.setSpeed(speed);
        frog.animation?.start();

        frog.on("mouseenter", () => {
          frog.animation?.stop();
        });

        this.mouseHandler.addEntity(frog);
        this.render.addEntity(frog);
      }
    };

    createFrogs();

    this.render.startRender();
    this.mouseHandler.start();
  }
}
