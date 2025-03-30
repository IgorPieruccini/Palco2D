import { SceneEventKeys } from "../../types";
import { BaseEntity } from "../BaseEntity";
import { generateUUID } from "../utils";

export class SceneEventHandlers {
  /**
   * Subscribers will be notified when an entity is added to the scene.
   */
  private addEntitySubscribers = new Map<
    string,
    (entity: BaseEntity) => void
  >();

  /**
   * Subscribers will be notified when an entity is removed from the scene.
   */
  private removeEntitySubscribers = new Map<
    string,
    (entity: BaseEntity) => void
  >();

  /**
   * Subscribe to a scene event and get notified when it happens.
   * @returns A unique identifier for the subscription, useful for unsubscribing.
   */
  public subscribeToSceneEvent(
    event: SceneEventKeys,
    callback: (entity: BaseEntity) => void,
  ): string {
    const id = generateUUID();
    switch (event) {
      case "addEntity":
        this.addEntitySubscribers.set(id, callback);
        break;
      case "removeEntity":
        this.removeEntitySubscribers.set(id, callback);
        break;
    }
    return id;
  }

  /**
   * Unsubscribe from a scene event.
   * to stop receiving notifications.
   */
  public unsubscribeToSceneEvent(event: SceneEventKeys, id: string): void {
    switch (event) {
      case "addEntity":
        this.addEntitySubscribers.delete(id);
        break;
      case "removeEntity":
        this.removeEntitySubscribers.delete(id);
        break;
    }
  }

  /**
   * Notify all the subscribers that an entity has been added to the scene.
   */
  public notify(event: SceneEventKeys, entity: BaseEntity): void {
    switch (event) {
      case "addEntity":
        this.addEntitySubscribers.forEach((callback) => callback(entity));
        break;
      case "removeEntity":
        this.removeEntitySubscribers.forEach((callback) => callback(entity));
        break;
    }
  }
}
