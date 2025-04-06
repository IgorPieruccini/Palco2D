import { ScenePlugin, WorldHandler } from "@palco-2d/core";

const ZOOM_SENSITIVITY = 1.1;

/*
 * Adds the ability to pan and zoom the canvas freely.
 * For panning, hold the space key and mouse right click while dragging
 * For zooming, use the mouse wheel
 */
export class InfinityCanvasPlugin extends ScenePlugin {
  private isDragging: boolean = false;
  private moveToolActive: boolean = false;

  private keydownHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      this.scene.canvas.style.cursor = "grab";
      this.moveToolActive = true;
    }
  };

  private keyupHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      this.scene.canvas.style.cursor = "default";
      this.moveToolActive = false;
    }
  };

  private mousedownHandler = () => {
    this.isDragging = true;
  };

  private mousemoveHandler = (e: MouseEvent) => {
    if (this.isDragging && this.moveToolActive) {
      this.scene.canvas.style.cursor = "grabbing";
      const offset = WorldHandler.getOffset();
      WorldHandler.setOffset({
        x: offset.x + e.movementX,
        y: offset.y + e.movementY,
      });
    }
  };

  private mouseupHandler = () => {
    this.isDragging = false;
  };

  private mouseleaveHandler = () => {
    this.isDragging = false;
  };

  private wheelHandler = (e: WheelEvent) => {
    e.preventDefault();

    const worldOffset = WorldHandler.getOffset();
    const worldZoom = WorldHandler.getZoom();

    const worldX = (e.offsetX - worldOffset.x) / worldZoom;
    const worldY = (e.offsetY - worldOffset.y) / worldZoom;

    if (e.deltaY > 0) {
      WorldHandler.setZoom(worldZoom * ZOOM_SENSITIVITY);
    } else {
      WorldHandler.setZoom(worldZoom / ZOOM_SENSITIVITY);
    }

    const zoom = WorldHandler.getZoom();
    WorldHandler.setOffset({
      x: e.offsetX - worldX * zoom,
      y: e.offsetY - worldY * zoom,
    });
  };

  start() {
    super.start();
    this.scene.canvas.addEventListener("mousedown", this.mousedownHandler);
    this.scene.canvas.addEventListener("mousemove", this.mousemoveHandler);
    this.scene.canvas.addEventListener("mouseup", this.mouseupHandler);
    this.scene.canvas.addEventListener("mouseleave", this.mouseleaveHandler);
    this.scene.canvas.addEventListener("wheel", this.wheelHandler);
    window.addEventListener("keydown", this.keydownHandler);
    window.addEventListener("keyup", this.keyupHandler);
  }

  stop() {
    super.stop();
    this.scene.canvas.removeEventListener("mousedown", this.mousedownHandler);
    this.scene.canvas.removeEventListener("mousemove", this.mousemoveHandler);
    this.scene.canvas.removeEventListener("mouseup", this.mouseupHandler);
    this.scene.canvas.removeEventListener("mouseleave", this.mouseleaveHandler);
    this.scene.canvas.removeEventListener("wheel", this.wheelHandler);
    window.removeEventListener("keydown", this.keydownHandler);
    window.removeEventListener("keyup", this.keyupHandler);
    WorldHandler.setZoom(1);
    WorldHandler.setOffset({ x: 0, y: 0 });
  }
}
