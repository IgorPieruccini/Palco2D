import {
  AssetHandler,
  BaseEntity,
  Scene,
  Sprite,
  SquareEntity,
} from "@palco-2d/core";
import { ActiveSelectionPlugin, InfinityCanvasPlugin } from "@palco-2d/plugins";

export class PluginsExample extends Scene {
  activeObject: BaseEntity | null = null;

  public async start() {
    await AssetHandler.loadPng("assets/ninja-frog-jump.png");

    const frog = new Sprite({
      id: "frog",
      texture: "assets/ninja-frog-jump.png",
      position: { x: 0, y: 0 },
      rotation: 0,
    });

    frog.size = { x: 64, y: 64 };
    frog.on("mousedown", () => {
      console.log("Frog clicked");
    });

    const rect = new SquareEntity({
      id: "rect",
      position: { x: 600, y: 200 },
      size: { x: 60, y: 60 },
      rotation: 0,
    });

    rect.on("mousedown", () => {
      console.log("Rect clicked");
    });

    this.addPlugin(InfinityCanvasPlugin, "infinityCanvas");
    this.addPlugin(ActiveSelectionPlugin, "activeSelection");

    this.addEntity(frog);
    this.addEntity(rect);
    this.render.startRender();
    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
