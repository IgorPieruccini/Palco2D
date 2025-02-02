import { FPSHandler } from "../FPSHandler";
import { ScenePlugin } from "../ScenePlugin";
import { Scene } from "../SceneHandler/Scene";

export class FPSViewPlugin extends ScenePlugin {
  private fpsHandler: ReturnType<typeof FPSHandler>;

  constructor(scene: Scene) {
    super(scene);
    this.fpsHandler = FPSHandler();
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.fillText(`FPS: ${this.fpsHandler.getFPS()}`, 50, 50);
  }
}
