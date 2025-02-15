import { Vec2 } from "./types";
import { generateUUID } from "./utils";

type Listener = { id: string; callback: (zoom: number) => void };

export const WorldHandler = (() => {
  let zoom = 1;
  let offset: Vec2 = { x: 0, y: 0 };
  const listeners: Array<Listener> = [];

  function Instance() {
    function getZoom() {
      return zoom;
    }

    function setZoom(newZoom: number) {
      zoom = newZoom;
      emitZoomUpdate();
    }

    function getOffset() {
      return offset;
    }

    function setOffset(newOffset: Vec2) {
      offset = newOffset;
    }

    function subscribeToZoomUpdate(callback: (zoom: number) => void) {
      const id = generateUUID();
      listeners.push({ id, callback });
    }

    function emitZoomUpdate() {
      listeners.forEach((listener) => listener.callback(zoom));
    }

    function unsubscribeFromZoomUpdate(id: string) {
      const index = listeners.findIndex((listener) => listener.id === id);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }

    return {
      getZoom,
      setZoom,
      getOffset,
      setOffset,
      subscribeToZoomUpdate,
      unsubscribeFromZoomUpdate,
    };
  }

  return Instance;
})();
