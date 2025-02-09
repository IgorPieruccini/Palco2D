import { AssetHandler } from "../core/AssetHandler";
import { EnityBoundariesPlugin } from "../core/Plugins/EntityBoundariesPlugin";
import { InfinityCanvasPlugin } from "../core/Plugins/InfinityCanvasPlugin";
import { Scene } from "../core/SceneHandler/Scene";
import { Sprite } from "../core/Sprite";
import { SquareEntity } from "../core/SquareEntity";

export class EntityPluginExample extends Scene {
  public async start() {
    await AssetHandler().loadPng("assets/ninja-frog-jump.png");

    const frog = new Sprite({
      texture: "assets/ninja-frog-jump.png",
      position: { x: 100, y: 100 },
      rotation: 0,
    });

    frog.size = { x: 64, y: 64 };

    frog.addPlugin(new EnityBoundariesPlugin(frog, "boundaries"));

    const rect = new SquareEntity({
      position: { x: 600, y: 200 },
      size: { x: 60, y: 60 },
      rotation: 0,
    });

    rect.addPlugin(new EnityBoundariesPlugin(rect, "boundaries"));

    this.addPlugin(new InfinityCanvasPlugin(this), "infinityCanvas");

    this.render.addEntity(frog);
    this.render.addEntity(rect);
    this.render.startRender();

    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
