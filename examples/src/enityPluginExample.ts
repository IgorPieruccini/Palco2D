import {
  AssetHandler,
  BaseEntity,
  Scene,
  Sprite,
  SquareEntity,
} from "@palco-2d/core";
import {
  TransformerEntityController,
  InfinityCanvasPlugin,
} from "@palco-2d/plugins";

export class EntityPluginExample extends Scene {
  activeObject: BaseEntity | null = null;

  public async start() {
    this.mouseHandler.onCanvas("mousedown", () => {
      if (this.activeObject) {
        this.activeObject.removeAllPlugins();
        this.activeObject = null;
      }
    });

    await AssetHandler.loadPng("assets/ninja-frog-jump.png");

    const frog = new Sprite({
      id: "frog",
      texture: "assets/ninja-frog-jump.png",
      position: { x: 0, y: 0 },
      rotation: 0,
    });

    frog.size = { x: 64, y: 64 };
    frog.on("mousedown", () => {
      if (this.activeObject?.id !== frog.id) {
        this.activeObject?.removeAllPlugins();
        frog.addPlugin(TransformerEntityController, "boundaries");
        this.activeObject = frog;
      }
    });

    const rect = new SquareEntity({
      id: "rect",
      position: { x: 600, y: 200 },
      size: { x: 60, y: 60 },
      rotation: 0,
    });

    rect.on("mousedown", () => {
      if (this.activeObject?.id !== rect.id) {
        this.activeObject?.removeAllPlugins();
        rect.addPlugin(TransformerEntityController, "boundaries");
        this.activeObject = rect;
      }
    });

    this.addPlugin(new InfinityCanvasPlugin(this), "infinityCanvas");

    this.render.addEntity(frog);
    this.render.addEntity(rect);
    this.render.startRender();

    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
