import { AssetHandler, Scene } from "@palco-2d/core";

export class SvgImageScene extends Scene {
  public async start() {
    await AssetHandler.loadSVG("assets/character.svg");

    console.log(AssetHandler.getAsset("assets/character.svg"));

    this.render.startRender();
  }
}
