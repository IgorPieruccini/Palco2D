import { BaseEntity, SceneHandler } from "@palco-2d/core";

/**
 * ActiveSelectionManager Keeps track of the currently selected entities in the scene
 * and notifies subscribers when the selection changes.
 * the selection is separated by elements in the canvas and upper canvas (eg: elements with isUI)
 */
export class ActiveSelectionManager {
  public static selectedEntities: Map<string, BaseEntity> = new Map();
  public static selectedEntitiesUI: Map<string, BaseEntity> = new Map();
  private pressingShift: boolean = false;
  private pressingSpace: boolean = false;

  /**
   * Subscriber will be notified when active selection changes
   */
  static onActiveSelectionSubscribers: Array<
    (entity: BaseEntity, entities: BaseEntity[]) => void
  > = [];

  /**
   * Subscriber will be notified when active UI selection changes
   */
  static onActiveSelectionUISubscribers: Array<
    (entity: BaseEntity, entities: BaseEntity[]) => void
  > = [];

  /**
   * Subscriber will be notified when active selection is cleared
   */
  static clearSelectionSubscribers: Array<() => void> = [];

  /**
   * Subscriber will be notified when active UI selection is cleared
   */
  static clearSelectionUISubscribers: Array<() => void> = [];

  constructor() {
    this.listenToKeyboardEvents();

    const scene = SceneHandler.currentScene;

    scene.mouseHandler.onEntity("mousedown", this.addOnMouseDown.bind(this));

    scene.mouseHandler.onCanvas("mousedown", () => {
      if (!this.pressingSpace) {
        this.clearSelection(false);
        this.clearSelection(true);
      }
    });
  }

  addOnMouseDown(entity: BaseEntity) {
    if (this.pressingSpace) {
      return;
    }

    const updateSelection = (isUI: boolean) => {
      const selectedEntities = isUI
        ? ActiveSelectionManager.selectedEntitiesUI
        : ActiveSelectionManager.selectedEntities;

      const isAlreadySelected = selectedEntities.has(entity.id);

      if (!this.pressingShift && !isAlreadySelected) {
        this.clearSelection(isUI);
      }

      selectedEntities.set(entity.id, entity);

      if (isUI) {
        this.notifyUISubscribers(entity);
      } else {
        this.notifySubscribers(entity);
      }
    };

    updateSelection(entity.isUI);
  }

  /**
   * Clear the selection of entities.
   * @param isUI - If true, clear the UI selection; otherwise, clear the regular selection.
   */
  public clearSelection(isUI: boolean) {
    if (isUI) {
      ActiveSelectionManager.selectedEntitiesUI.clear();
      this.notifyClearUISelectionSubscribers();
    } else {
      ActiveSelectionManager.selectedEntities.clear();
      this.notifyClearSelectionSubscribers();
    }
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

  /**
   * Subscribe to active selection event.
   * @param callback - The callback function to be called when the selection changes.
   */
  public onActiveSelection(
    callback: (entity: BaseEntity, entities: BaseEntity[]) => void,
  ) {
    ActiveSelectionManager.onActiveSelectionSubscribers.push(callback);
  }

  /**
   * Subscribe to active UI selection event.
   * @param callback - The callback function to be called when the selection changes.
   */
  public onActiveUISelection(
    callback: (entity: BaseEntity, entities: BaseEntity[]) => void,
  ) {
    ActiveSelectionManager.onActiveSelectionUISubscribers.push(callback);
  }

  /**
   * Subscribe to clear selection event.
   * @param callback - The callback function to be called when the selection is cleared.
   */
  public onClearSelection(callback: () => void) {
    ActiveSelectionManager.clearSelectionSubscribers.push(callback);
  }

  /**
   * Subscribe to clear UI selection event.
   * @param callback - The callback function to be called when the selection is cleared.
   */
  public onClearUISelection(callback: () => void) {
    ActiveSelectionManager.clearSelectionUISubscribers.push(callback);
  }

  /*
   * Notify all subscribers that the selection has changed.
   * @param entity - The entity that was selected or deselected.
   */
  public notifySubscribers(entity: BaseEntity) {
    ActiveSelectionManager.onActiveSelectionSubscribers.forEach((callback) => {
      callback(
        entity,
        Array.from(ActiveSelectionManager.selectedEntities.values()),
      );
    });
  }

  /*
   * Notify all subscribers that the UI selection has changed.
   * @param entity - The entity that was selected or deselected.
   */
  public notifyUISubscribers(entity: BaseEntity) {
    ActiveSelectionManager.onActiveSelectionUISubscribers.forEach(
      (callback) => {
        callback(
          entity,
          Array.from(ActiveSelectionManager.selectedEntitiesUI.values()),
        );
      },
    );
  }

  /*
   * Notify all subscribers that the selection has been cleared.
   */
  public notifyClearSelectionSubscribers() {
    ActiveSelectionManager.clearSelectionSubscribers.forEach((callback) => {
      callback();
    });
  }

  /*
   * Notify all subscribers that the UI selection has been cleared.
   */
  public notifyClearUISelectionSubscribers() {
    ActiveSelectionManager.clearSelectionUISubscribers.forEach((callback) => {
      callback();
    });
  }

  /**
   * Add an entity to the active selection.
   */
  public addEntityToSelection(entity: BaseEntity) {
    ActiveSelectionManager.selectedEntities.set(entity.id, entity);
    this.notifySubscribers(entity);
  }

  /**
   * Add an entity to the active UI selection.
   */
  public addEntityToUISelection(entity: BaseEntity) {
    ActiveSelectionManager.selectedEntitiesUI.set(entity.id, entity);
    this.notifyUISubscribers(entity);
  }
}
