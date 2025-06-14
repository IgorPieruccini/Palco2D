import { ActiveSelectionManager } from "../../plugins/src/ActiveSelectionManager";
import { BaseEntity } from "./BaseEntity";
import { Scene } from "./SceneHandler/Scene";

export class ScenePlugin {
  public running: boolean = false;
  public scene: Scene;
  public activeSelectionHandler = new ActiveSelectionManager();

  constructor(scene: Scene) {
    this.scene = scene;

    // ##### subscribe to active selection events #####
    this.activeSelectionHandler.onActiveSelection(
      this.onActiveSelectionUpdate.bind(this),
    );

    this.activeSelectionHandler.onClearSelection(
      this.onClearSelection.bind(this),
    );

    // ##### subscribe to active UI selection events #####
    this.activeSelectionHandler.onActiveUISelection(
      this.onClearUISelection.bind(this),
    );

    this.activeSelectionHandler.onClearUISelection(
      this.onClearUISelection.bind(this),
    );

    this.init();
  }

  public init() {}

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
  public render(ctx: CanvasRenderingContext2D) {}

  /**
   * Called when the active selection changes.
   * This is where you can implement your own logic to handle what's
   * happening when an entity is selected or deselected.
   */
  protected onActiveSelectionUpdate(
    entity: BaseEntity | null,
    entities: BaseEntity[],
  ) {}

  /**
   * Called when active selection is clear (no entity selected)
   * this is where you can implement your when logic to handle
   *  side effects when the user deselect all entities
   */
  protected onClearSelection() {}

  /**
   * Called when the active UI selection changes.
   * This is where you can implement your own logic to handle what's
   * happening when an entity is selected or deselected.
   */
  protected onActiveUISelectionUpdate(
    entity: BaseEntity | null,
    entities: BaseEntity[],
  ) {}

  /**
   * Called when the active UI selection is cleared.
   * This is where you can implement your own logic to handle what's
   * happening when the user deselects all entities.
   */
  protected onClearUISelection() {}
}
