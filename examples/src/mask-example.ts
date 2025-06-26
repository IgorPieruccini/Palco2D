import {
  AssetHandler,
  SVGImageEntity,
  Scene,
  Sprite,
  SquareEntity,
} from "@palco-2d/core";

export class MaskExample extends Scene {
  public async start() {
    await AssetHandler.loadPng("assets/ninja-frog-jump.png");
    await AssetHandler.loadSVG("assets/svg-test.svg");

    const squareMask = new SquareEntity({
      color: "blue",
      position: {
        x: 100,
        y: 100,
      },
      size: {
        x: 100,
        y: 100,
      },
      rotation: 0,
    });

    const maskedSquare = new SquareEntity({
      color: "red",
      position: {
        x: 80,
        y: 0,
      },
      size: {
        x: 100,
        y: 100,
      },
    });

    const maskedSquareTwo = new SquareEntity({
      color: "green",
      position: {
        x: 50,
        y: 50,
      },
      size: {
        x: 100,
        y: 100,
      },
    });

    const sprite = new Sprite({
      texture: "assets/ninja-frog-jump.png",
      position: {
        x: 150,
        y: 100,
      },
      //useAsMask: true,
    });

    sprite.size = {
      x: 200,
      y: 200,
    };

    const frog = new Sprite({
      texture: "assets/ninja-frog-jump.png",
      position: {
        x: 150,
        y: 100,
      },
      globalCompositeOperation: "hard-light",
    });

    frog.size = {
      x: 100,
      y: 100,
    };

    squareMask.addChild(maskedSquare);
    squareMask.addChild(maskedSquareTwo);

    const svg = new SVGImageEntity({
      id: "SVG-TEST",
      src: "assets/svg-test.svg",
      position: {
        x: 100,
        y: 100,
      },
    });

    this.addEntity(svg);
    this.addEntity(squareMask);
    // this.addEntity(sprite);
    // this.addEntity(frog);
    this.render.startRender();
  }
}
