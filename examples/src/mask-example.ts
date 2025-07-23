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
  RotateEntityPlugin,
} from "@palco-2d/plugins";

export class MaskExample extends Scene {
  public async start() {
    await AssetHandler.loadPng("assets/ninja-frog-jump.png");
    await AssetHandler.loadSVG("assets/svg-test.svg");

    this.addPlugin(InfinityCanvasPlugin, "infinityCanvas");
    this.addPlugin(ActiveSelectionPlugin, "ActiveSelection");
    this.addPlugin(AreaSelectionPlugin, "AreaSelectionPlugin");
    this.addPlugin(MoveEntityPlugin, "MoveEntityPlugin");
    this.addPlugin(RotateEntityPlugin, "RotateEntityPlugin");

    const squareMask = new SquareEntity({
      color: "blue",
      position: {
        x: 0,
        y: 0,
      },
      size: {
        x: 50,
        y: 50,
      },
    });

    const maskedSquare = new SquareEntity({
      color: "red",
      position: {
        x: 80,
        y: -30,
      },
      size: {
        x: 200,
        y: 200,
      },
    });

    const maskedSquareTwo = new SquareEntity({
      color: "green",
      position: {
        x: -50,
        y: 50,
      },
      size: {
        x: 200,
        y: 200,
      },
    });

    const sprite = new Sprite({
      texture: "assets/ninja-frog-jump.png",
      position: {
        x: 100,
        y: 120,
      },
      useAsMask: true,
    });

    sprite.size = {
      x: 100,
      y: 100,
    };

    const frog = new Sprite({
      id: "frog",
      texture: "assets/ninja-frog-jump.png",
      position: {
        x: 150,
        y: 600,
      },
    });

    frog.size = {
      x: 100,
      y: 100,
    };

    const svg = new SVGImageEntity({
      id: "SVG-TEST",
      src: "assets/svg-test.svg",
      position: {
        x: 300,
        y: 200,
      },
      useAsMask: true,
    });

    svg.addChild(maskedSquare);
    svg.addChild(maskedSquareTwo);

    sprite.addChild(squareMask);
    svg.addChild(sprite);

    this.addEntity(svg);
    this.addEntity(frog);

    this.render.startRender();
    this.startAllPlugins();
    this.mouseHandler.start();
  }
}
