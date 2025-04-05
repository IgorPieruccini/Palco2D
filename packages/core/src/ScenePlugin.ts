import { ActiveSelectionManager } from "../../plugins/src/ActiveSelectionManager";
import { Scene } from "./SceneHandler/Scene";

export class ScenePlugin {
  public running: boolean = false;
  public scene: Scene;
  public activeSelectionHandler = new ActiveSelectionManager();

  constructor(scene: Scene) {
    this.scene = scene;
    this.init();
  }

  public init() { }

  public start() {
    this.running = true;
  }

  public stop() {
    this.running = false;
  }

  public render(ctx: CanvasRenderingContext2D) { }
}
