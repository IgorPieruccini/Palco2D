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

    this.activeSelectionHandler.onClearSelection(
      this.onClearSelection.bind(this),
    );

    this.init();
  }

  public init() { }

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
    entity: BaseEntity | null,
    entities: BaseEntity[],
  ) { }

  /**
   * Called when active selection is clear (no entity selected)
   * this is where you can implement your when logic to handle
   *  side effects when the user deselect all entities
   */
  protected onClearSelection() { }
}
