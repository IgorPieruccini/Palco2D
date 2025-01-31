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

      square.on("mouseenter", () => {
        square.color = "#FFC300";
      });

      square.on("mouseleave", () => {
        square.color = "#3C1518";
      });

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
        this.world.setOffset({
          x: this.world.getOffset().x + e.movementX,
          y: this.world.getOffset().y + e.movementY,
        });
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

      const worldOffset = this.world.getOffset();
      const worldZoom = this.world.getZoom();

      const worldX = (e.offsetX - worldOffset.x) / worldZoom;
      const worldY = (e.offsetY - worldOffset.y) / worldZoom;

      if (e.deltaY > 0) {
        this.world.setZoom(worldZoom * ZOOM_SENSITIVITY);
      } else {
        this.world.setZoom(worldZoom / ZOOM_SENSITIVITY);
      }

      this.world.setOffset({
        x: e.offsetX - worldX * this.world.getZoom(),
        y: e.offsetY - worldY * this.world.getZoom(),
      });
    });

    this.render.addEntities(entities);
    this.mouseHandler.addEntities(entities);

    this.render.startRender();
    this.mouseHandler.start();
  }
}
