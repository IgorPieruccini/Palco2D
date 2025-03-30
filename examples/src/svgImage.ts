import { AssetHandler, SVGImageEntity, Scene, Sprite } from "@palco-2d/core";
import { ActiveSelectionPlugin, InfinityCanvasPlugin } from "@palco-2d/plugins";

export class SvgImageScene extends Scene {
  public async start() {
    await AssetHandler.loadSVG("assets/tiger.svg");
    await AssetHandler.loadPng("assets/ninja-frog-jump.png");

    const svgEntity = new SVGImageEntity({
      position: { x: 300, y: 300 },
      rotation: 45,
      src: "assets/tiger.svg",
    });

    svgEntity.size = { x: 500, y: 500 };

    const frog = new Sprite({
      texture: "assets/ninja-frog-jump.png",
      position: { x: 0, y: 0 },
      rotation: 0,
    });

    this.addPlugin(InfinityCanvasPlugin, "infinityCanvas");
    this.addPlugin(ActiveSelectionPlugin, "activeSelection");

    this.addEntity(svgEntity);
    this.addEntity(frog);
    this.render.startRender();
    this.startAllPlugins();
  }
}
