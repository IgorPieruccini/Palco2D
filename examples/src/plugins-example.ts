import {
  AssetHandler,
  BaseEntity,
  SVGImageEntity,
  Scene,
  Sprite,
  SquareEntity,
} from "@palco-2d/core";
import { ActiveSelectionPlugin, InfinityCanvasPlugin } from "@palco-2d/plugins";

export class PluginsExample extends Scene {
  public async start() {
    await AssetHandler.loadPng("assets/ninja-frog-jump.png");
    await AssetHandler.loadSVG("assets/character.svg");

    const frog = new Sprite({
      id: "frog",
      texture: "assets/ninja-frog-jump.png",
      position: { x: 100, y: 100 },
      rotation: 0,
    });

    frog.size = { x: 64, y: 64 };

    const rect = new SquareEntity({
      id: "rect",
      position: { x: 600, y: 200 },
      size: { x: 60, y: 60 },
      rotation: 45,
    });

    const character = new SVGImageEntity({
      id: "character",
      position: { x: 400, y: 500 },
      rotation: 45,
      src: "assets/character.svg",
    });

    this.addPlugin(InfinityCanvasPlugin, "infinityCanvas");
    this.addPlugin(ActiveSelectionPlugin, "activeSelection");

    this.addEntity(frog);
    this.addEntity(rect);
    this.addEntity(character);

    this.render.startRender();
    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
