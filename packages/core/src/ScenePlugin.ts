import { ActiveSelectionManager } from "../../plugins/src/ActiveSelectionManager";
import { BaseEntity } from "./BaseEntity";
import { Scene } from "./SceneHandler/Scene";

export class ScenePlugin {
  public running: boolean = false;
  public scene: Scene;
  public activeSelectionHandler = new ActiveSelectionManager();

  constructor(scene: Scene) {
    this.scene = scene;

    this.activeSelectionHandler.onActiveSelection(
      this.onActiveSelectionUpdate.bind(this),
    );

    this.init();
  }

  public init() {
    console.warn("init not implemented in plugin");
  }

  public start() {
    this.running = true;
  }

  public stop() {
    this.running = false;
  }

  /**
   * Called every frame to render the plugin.
   * @param ctx - The canvas rendering context.
   */
  public render(ctx: CanvasRenderingContext2D) { }

  /**
   * Called when the active selection changes.
   * This is where you can implement your own logic to handle what's
   * happening when an entity is selected or deselected.
   */
  protected onActiveSelectionUpdate(
    entity: BaseEntity,
    entities: BaseEntity[],
  ) {
    console.warn("onActiveSelectionUpdate not implemented in plugin");
  }
}
