import { AssetHandler } from "../core/AssetHandler";
import { Scene } from "../core/SceneHandler/Scene";
import { Sprite } from "../core/Sprite";

export class TileMapExample extends Scene {

  constructor(canvas: HTMLCanvasElement, name: string) {
    super(canvas, name);
  }

  public async start() {
    const ninjaTexture = await AssetHandler().loadPng('frog', 'assets/ninja-frog-run.png');
    const ninjaTileMap = await AssetHandler().loadTileMap('frog-tilemap', 'assets/ninja-frog-run.tilemap.json');

    const createFrogs = () => {
      for (let x = 0; x < 500; x++) {
        const frog = new Sprite({
          texture: ninjaTexture,
          position: { x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height },
          rotation: 0,
          tileMap: ninjaTileMap,
        });

        const speed = 2 + (Math.random()) * 2;
        frog.animation?.setSpeed(speed);
        frog.animation?.start();


        frog.on('mouseenter', () => {
          frog.animation?.stop();
        });


        this.mouseHandler.addEntity(frog);
        this.render.addEntity(frog);
      }
    }

    createFrogs();

    this.mouseHandler.start();
    this.render.startRender();
  }

}

