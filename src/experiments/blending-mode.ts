import { AssetHandler } from "../core/AssetHandler";
import { Scene } from "../core/SceneHandler/Scene";
import { Sprite } from "../core/Sprite";
import { SquareEntity } from "../core/SquareEntity";

export class BlendingModeExample extends Scene {

  public async start() {

    const init = async () => {
      const texture = await AssetHandler().loadPng('frog', 'assets/ninja-frog-jump.png');

      const mainFrog = new Sprite({
        texture,
        position: { x: 120, y: 100 },
        rotation: 0,
        layer: 1,
        globalCompositeOperation: 'hard-light'
      });

      mainFrog.size = { x: 84, y: 84 };


      this.ctx.rect(10, 10, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'red';


      const square = new SquareEntity({
        position: { x: 100, y: 100 },
        size: { x: 100, y: 100 },
        rotation: 0,
      });


      this.render.addEntities([mainFrog, square]);
      this.render.startRender();

    };

    init();
  }

}
