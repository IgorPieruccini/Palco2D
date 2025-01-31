import { BaseEntity } from "../core/BaseEntity";
import { Scene } from "../core/SceneHandler/Scene";
import { SquareEntity } from "../core/SquareEntity";

const ZOOM_SENSITIVITY = 1.1;

export class InvitiyCanvasSceneExample extends Scene {
  public async start() {
    const entities: BaseEntity[] = [];

    let x = 0;
    let y = 0;
    for (let i = 0; i < 1000; i++) {
      const square = new SquareEntity({
        position: { x, y },
        size: { x: 50, y: 50 },
        rotation: 0,
        color: "#3C1518",
      });

      x += 80;
      if (i % 33 === 0) {
        x = 0;
        y += 80;
      }

      entities.push(square);
    }

    let isDragging = false;
    let moveToolActive = false;

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        this.canvas.style.cursor = "grab";
        moveToolActive = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        this.canvas.style.cursor = "default";
        moveToolActive = false;
      }
    });

    this.canvas.addEventListener("mousedown", () => {
      isDragging = true;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (isDragging && moveToolActive) {
        this.canvas.style.cursor = "grabbing";
        this.render.offset = {
          x: this.render.offset.x + e.movementX,
          y: this.render.offset.y + e.movementY,
        };
      }
    });

    this.canvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      isDragging = false;
    });

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();

      const worldX = (e.offsetX - this.render.offset.x) / this.render.zoom;
      const worldY = (e.offsetY - this.render.offset.y) / this.render.zoom;

      if (e.deltaY > 0) {
        this.render.zoom *= ZOOM_SENSITIVITY;
      } else {
        this.render.zoom /= ZOOM_SENSITIVITY;
      }

      this.render.offset = {
        x: e.offsetX - worldX * this.render.zoom,
        y: e.offsetY - worldY * this.render.zoom,
      };
    });

    this.render.addEntities(entities);
    this.render.startRender();
  }
}
