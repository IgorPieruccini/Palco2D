import { AssetHandler } from "../core/AssetHandler";
import { BaseEntity } from "../core/BaseEntity";
import { Scene } from "../core/SceneHandler/Scene";
import { Sprite } from "../core/Sprite";

export class SceneExample extends Scene {
  constructor(canvas: HTMLCanvasElement, name: string) {
    super(canvas, name);
  }

  public async start() {
    const texture = await AssetHandler().loadPng('frog', 'assets/ninja-frog-jump.png');

    const createFrogs = () => {
      for (let x = 0; x < 1000; x++) {
        const frog = new Sprite({
          texture,
          position: { x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height },
          rotation: 0
        });

        frog.size = { x: 64, y: 54 };

        frog.on('mouseenter', () => {
          frog.size = { x: frog.size.x + 10, y: frog.size.y + 10 };
        });

        frog.on('mouseleave', () => {
          frog.size = { x: frog.size.x - 10, y: frog.size.y - 10 };
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