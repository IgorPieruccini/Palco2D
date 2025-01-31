import { Vec2 } from "./types";

export const WorldHandler = (() => {
  let zoom = 1;
  let offset: Vec2 = { x: 0, y: 0 };

  function Instance() {
    function getZoom() {
      return zoom;
    }

    function setZoom(newZoom: number) {
      zoom = newZoom;
    }

    function getOffset() {
      return offset;
    }

    function setOffset(newOffset: Vec2) {
      offset = newOffset;
    }

    return {
      getZoom,
      setZoom,
      getOffset,
      setOffset,
    };
  }

  return Instance;
})();
