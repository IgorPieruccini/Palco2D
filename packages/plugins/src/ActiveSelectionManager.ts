import { BaseEntity, SceneHandler } from "@palco-2d/core";

/**
 * ActiveSelectionManager Keeps track of the currently selected entities in the scene
 * and notifies subscribers when the selection changes.
 */
export class ActiveSelectionManager {
  public static selectedEntities: Map<string, BaseEntity> = new Map();
  private pressingShift: boolean = false;
  private pressingSpace: boolean = false;

  /**
   * Subscriber will be notified when active selection changes
   */
  static subscribers: Array<
    (entity: BaseEntity, entities: BaseEntity[]) => void
  > = [];

  constructor() {
    this.listenToKeyboardEvents();

    const scene = SceneHandler.currentScene;

    scene.eventHandler.subscribeToSceneEvent(
      "addEntity",
      this.addOnMouseDown.bind(this),
    );

    scene.eventHandler.subscribeToSceneEvent(
      "addChild",
      this.addOnMouseDown.bind(this),
    );

    scene.mouseHandler.onCanvas("mousedown", () => {
      if (!this.pressingSpace) {
        this.clearSelection();
      }
    });
  }

  addOnMouseDown(entity: BaseEntity) {
    entity.on("mousedown", () => {
      if (this.pressingSpace) {
        return;
      }

      if (!this.pressingShift) {
        this.clearSelection();
      }

      ActiveSelectionManager.selectedEntities.set(entity.id, entity);
      this.notifySubscribers(entity);
    });
  }

  private clearSelection() {
    ActiveSelectionManager.selectedEntities.clear();
  }

  private listenToKeyboardEvents() {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        this.pressingShift = true;
      }

      if (event.code === "Space") {
        this.pressingSpace = true;
      }
    });

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        this.pressingShift = false;
      }

      if (event.code === "Space") {
        this.pressingSpace = false;
      }
    });
  }

  public onActiveSelection(
    callback: (entity: BaseEntity, entities: BaseEntity[]) => void,
  ) {
    ActiveSelectionManager.subscribers.push(callback);
  }

  public notifySubscribers(entity: BaseEntity) {
    ActiveSelectionManager.subscribers.forEach((callback) => {
      callback(
        entity,
        Array.from(ActiveSelectionManager.selectedEntities.values()),
      );
    });
  }
}
