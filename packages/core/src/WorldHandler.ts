import { Vec2 } from "../types";
import { generateUUID } from "./utils";

type Listener = { id: string; callback: (zoom: number) => void };

/**
 * Handles the zoom and offset of the canvas, ensuring all drawn objects are properly scaled and positioned.
 */
export class WorldHandler {
  private static zoom: number = 1;
  private static offset: Vec2 = { x: 0, y: 0 };
  private static listeners: Array<Listener> = [];

  /**
   * @returns The current zoom value.
   */
  static getZoom() {
    return WorldHandler.zoom;
  }

  /**
   * Sets the new zoom value.
   * @param newZoom - The new zoom value.
   */
  static setZoom(newZoom: number) {
    WorldHandler.zoom = newZoom;
    WorldHandler.emitZoomUpdate();
  }

  /**
   * @returns The current offset value.
   */
  static getOffset() {
    return WorldHandler.offset;
  }

  /**
   * Sets the new offset value.
   * @param newOffset - The new offset value
   */
  static setOffset(newOffset: Vec2) {
    WorldHandler.offset = newOffset;
  }

  /**
   * Subscribe to zoom updates.
   * @param callback - The callback that will be called when the zoom value changes.
   * @returns The id of the listener, used to unsubscribe from the updates.
   */
  static subscribeToZoomUpdate(callback: (zoom: number) => void) {
    const id = generateUUID();
    WorldHandler.listeners.push({ id, callback });
    return id;
  }

  /**
   * Emit the zoom update to all listeners.
   * @private
   */
  private static emitZoomUpdate() {
    WorldHandler.listeners.forEach((listener) =>
      listener.callback(WorldHandler.zoom),
    );
  }

  /**
   * Unsubscribe from zoom updates.
   * @param id - The id of the listener.
   */
  static unsubscribeFromZoomUpdate(id: string) {
    const index = WorldHandler.listeners.findIndex(
      (listener) => listener.id === id,
    );
    if (index !== -1) {
      WorldHandler.listeners.splice(index, 1);
    }
  }
}
