import { AssetHandler, SVGImageEntity, Scene, Sprite } from "@palco-2d/core";
import { BoundingBoxEntity, InfinityCanvasPlugin } from "@palco-2d/plugins";

export class SvgImageScene extends Scene {
  public async start() {
    await AssetHandler.loadSVG("assets/building.svg");
    await AssetHandler.loadPng("assets/ninja-frog-jump.png");

    const svgEntity = new SVGImageEntity({
      position: { x: 414, y: 387 },
      rotation: 0,
      src: "assets/building.svg",
    });

    svgEntity.addPlugin(BoundingBoxEntity, "boundingBoxEntity");

    const frog = new Sprite({
      texture: "assets/ninja-frog-jump.png",
      position: { x: 0, y: 0 },
      rotation: 0,
    });

    frog.addPlugin(BoundingBoxEntity, "boundingBoxEntity");

    this.addPlugin(new InfinityCanvasPlugin(this), "infinityCanvasPlugin");

    this.render.addEntity(svgEntity);
    this.render.addEntity(frog);
    this.render.startRender();
    this.startAllPlugins();
  }
}
