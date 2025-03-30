import { AssetHandler, Scene, Sprite } from "@palco-2d/core";

export class FlipSpriteExample extends Scene {
  public async start() {
    await AssetHandler.loadPng("assets/ninja-frog-jump.png");

    const frog = new Sprite({
      texture: "assets/ninja-frog-jump.png",
      position: { x: 100, y: 100 },
      rotation: 0,
    });

    frog.size = { x: 64, y: 64 };

    const flippedFrog = new Sprite({
      texture: "assets/ninja-frog-jump.png",
      position: { x: 200, y: 100 },
      rotation: 0,
    });

    flippedFrog.size = { x: -64, y: 64 };

    this.addEntity(frog);
    this.addEntity(flippedFrog);
    this.render.startRender();
  }
}
