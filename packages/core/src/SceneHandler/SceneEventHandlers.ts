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
   * The callback will be called when an entity is added to the scene.
   * @returns A unique identifier for the subscription, useful for unsubscribing.
   */
  public subscribeToAddEntity(callback: (entity: BaseEntity) => void): string {
    const id = generateUUID();
    this.addEntitySubscribers.set(id, callback);
    return id;
  }

  /**
   * The callback will be called when an entity is removed from the scene.
   */
  public unsubscribeToAddEntity(id: string): void {
    this.addEntitySubscribers.delete(id);
  }

  /**
   * The callback will be called when an entity is removed from the scene.
   * @returns A unique identifier for the subscription, useful for unsubscribing.
   */
  public subscribeToRemoveEntity(
    callback: (entity: BaseEntity) => void,
  ): string {
    const id = generateUUID();
    this.removeEntitySubscribers.set(id, callback);
    return id;
  }

  /**
   * The callback will be called when an entity is removed from the scene.
   */
  public unsubscribeToRemoveEntity(id: string): void {
    this.removeEntitySubscribers.delete(id);
  }

  /**
   * Notify all the subscribers that an entity has been added to the scene.
   */
  public notifyAddEntity(entity: BaseEntity): void {
    this.addEntitySubscribers.forEach((callback) => callback(entity));
  }

  /**
   * Notify all the subscribers that an entity has been removed from the scene.
   */
  public notifyRemoveEntity(entity: BaseEntity): void {
    this.removeEntitySubscribers.forEach((callback) => callback(entity));
  }
}
