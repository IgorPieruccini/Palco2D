import { FPSHandler, ScenePlugin, Scene } from "@palco-2d/core";

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
