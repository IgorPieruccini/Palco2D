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
        x: 100,
        y: 100,
      },
      size: {
        x: 200,
        y: 200,
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
        x: 150,
        y: 100,
      },
    });

    sprite.size = {
      x: 200,
      y: 200,
    };

    // const frog = new Sprite({
    //   texture: "assets/ninja-frog-jump.png",
    //   position: {
    //     x: 150,
    //     y: 100,
    //   },
    //   globalCompositeOperation: "hard-light",
    // });

    // frog.size = {
    //   x: 100,
    //   y: 100,
    // };

    const svg = new SVGImageEntity({
      id: "SVG-TEST",
      src: "assets/svg-test.svg",
      position: {
        x: 300,
        y: 200,
      },
      useAsMask: true,
    });

    svg.addChild(squareMask);
    svg.addChild(maskedSquare);
    svg.addChild(maskedSquareTwo);
    svg.addChild(sprite);

    this.addEntity(svg);
    // this.addEntity(sprite);
    // this.addEntity(frog);
    this.render.startRender();
    this.startAllPlugins();
    this.mouseHandler.start();
  }
}
