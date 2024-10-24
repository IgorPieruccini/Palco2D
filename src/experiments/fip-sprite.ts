import { AssetHandler } from "../core/AssetHandler";
import { Scene } from "../core/SceneHandler/Scene";
import { Sprite } from "../core/Sprite";

export class FlipSpriteExample extends Scene {

  public async start() {
    const texture = await AssetHandler().loadPng('frog', 'assets/ninja-frog-jump.png');

    const frog = new Sprite({
      texture,
      position: { x: 100, y: 100 },
      rotation: 0
    });

    frog.size = { x: 64, y: 64 };

    const flippedFrog = new Sprite({
      texture,
      position: { x: 200, y: 100 },
      rotation: 0
    });

    flippedFrog.size = { x: -64, y: 64 };

    this.render.addEntity(frog);
    this.render.addEntity(flippedFrog);
    this.render.startRender();
  }
}
