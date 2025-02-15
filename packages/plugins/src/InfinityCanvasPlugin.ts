import { Scene, ScenePlugin } from "@palco-2d/core";

const ZOOM_SENSITIVITY = 1.1;

export class InfinityCanvasPlugin extends ScenePlugin {
  private isDragging: boolean = false;
  private moveToolActive: boolean = false;

  constructor(scene: Scene) {
    super(scene);
  }

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
      this.scene.world.setOffset({
        x: this.scene.world.getOffset().x + e.movementX,
        y: this.scene.world.getOffset().y + e.movementY,
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

    const worldOffset = this.scene.world.getOffset();
    const worldZoom = this.scene.world.getZoom();

    const worldX = (e.offsetX - worldOffset.x) / worldZoom;
    const worldY = (e.offsetY - worldOffset.y) / worldZoom;

    if (e.deltaY > 0) {
      this.scene.world.setZoom(worldZoom * ZOOM_SENSITIVITY);
    } else {
      this.scene.world.setZoom(worldZoom / ZOOM_SENSITIVITY);
    }

    this.scene.world.setOffset({
      x: e.offsetX - worldX * this.scene.world.getZoom(),
      y: e.offsetY - worldY * this.scene.world.getZoom(),
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
    this.scene.world.setZoom(1);
    this.scene.world.setOffset({ x: 0, y: 0 });
  }

  render() {
    // Your code here
  }
}
