import {
  AssetHandler,
  SVGImageEntity,
  Scene,
  Sprite,
  SquareEntity,
} from "@palco-2d/core";
import {
  ActiveSelectionPlugin,
  AreaSelectionPlugin,
  InfinityCanvasPlugin,
  MoveEntityPlugin,
} from "@palco-2d/plugins";

export class PluginsExample extends Scene {
  public async start() {
    await AssetHandler.loadPng("assets/ninja-frog-jump.png");
    await AssetHandler.loadSVG("assets/character.svg");

    this.addPlugin(InfinityCanvasPlugin, "infinityCanvas");
    this.addPlugin(ActiveSelectionPlugin, "activeSelection");
    this.addPlugin(MoveEntityPlugin, "moveEntity");
    this.addPlugin(AreaSelectionPlugin, "areaSelection");

    const frog = new Sprite({
      id: "frog",
      texture: "assets/ninja-frog-jump.png",
      position: { x: 100, y: 100 },
      rotation: 0,
    });

    frog.size = { x: 64, y: 64 };

    const rect = new SquareEntity({
      id: "rect",
      position: { x: 600, y: 500 },
      size: { x: 60, y: 60 },
      rotation: 0,
    });

    const character = new SVGImageEntity({
      id: "character",
      position: { x: 400, y: 500 },
      rotation: 0,
      src: "assets/character.svg",
    });

    // setTimeout(() => {
    //   character.unfold();
    // }, 1000);
    //
    // const pos = rotateAround(rect.position, character.position, 180 * Math.PI / 180);
    // rect.position = pos;

    rect.on("mousedown", () => {
      character.fold();
    });

    this.addEntity(frog);
    this.addEntity(rect);
    this.addEntity(character);

    this.render.startRender();
    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
