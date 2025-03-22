import { AssetHandler, SVGImageEntity, Scene } from "@palco-2d/core";
import { BoundingBoxEntity, InfinityCanvasPlugin } from "@palco-2d/plugins";

export class SvgImageScene extends Scene {
  public async start() {
    await AssetHandler.loadSVG("assets/building.svg");

    const svgEntity = new SVGImageEntity({
      position: { x: 0, y: 0 },
      rotation: 0,
      src: "assets/building.svg",
    });

    svgEntity.addPlugin(BoundingBoxEntity, "boundingBoxEntity");
    svgEntity.size = { x: 256, y: 256 };

    this.addPlugin(new InfinityCanvasPlugin(this), "infinityCanvasPlugin");

    this.render.addEntity(svgEntity);
    this.render.startRender();
    this.startAllPlugins();
  }
}
