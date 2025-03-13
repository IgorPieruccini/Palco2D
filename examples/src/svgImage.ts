import { AssetHandler, SVGImageEntity, Scene } from "@palco-2d/core";
import { InfinityCanvasPlugin } from "@palco-2d/plugins";

export class SvgImageScene extends Scene {
  public async start() {
    await AssetHandler.loadSVG("assets/tiger.svg");

    const svgEntity = new SVGImageEntity({
      position: { x: 100, y: 100 },
      size: { x: 100, y: 100 },
      rotation: 0,
      src: "assets/tiger.svg",
    });

    this.addPlugin(new InfinityCanvasPlugin(this), "infinityCanvasPlugin");

    this.render.addEntity(svgEntity);
    this.render.startRender();
    this.startAllPlugins();
  }
}
