import { Scene } from "./SceneHandler/Scene";

export class ScenePlugin {
  public running: boolean = false;
  public scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public start() {
    this.running = true;
  }

  public stop() {
    this.running = false;
  }

  public render(ctx: CanvasRenderingContext2D) { }
}
