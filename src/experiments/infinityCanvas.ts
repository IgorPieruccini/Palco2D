import { BaseEntity } from "../core/BaseEntity";
import { Scene } from "../core/SceneHandler/Scene";
import { SquareEntity } from "../core/SquareEntity";

const ZOOM_SENSITIVITY = 1.1;

export class InvitiyCanvasSceneExample extends Scene {
  private isDragging: boolean = false;
  private moveToolActive: boolean = false;

  private keydownHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      this.canvas.style.cursor = "grab";
      this.moveToolActive = true;
    }
  };

  private keyupHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      this.canvas.style.cursor = "default";
      this.moveToolActive = false;
    }
  };

  private mousedownHandler = () => {
    this.isDragging = true;
  };

  private mousemoveHandler = (e: MouseEvent) => {
    if (this.isDragging && this.moveToolActive) {
      this.canvas.style.cursor = "grabbing";
      this.world.setOffset({
        x: this.world.getOffset().x + e.movementX,
        y: this.world.getOffset().y + e.movementY,
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
  };

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

    const square = new SquareEntity({
      position: { x: 200, y: 0 },
      size: { x: 50, y: 50 },
      rotation: 0,
      color: "blue",
    });

    entities[0].addChild(square);

    this.canvas.addEventListener("mousedown", this.mousedownHandler);
    this.canvas.addEventListener("mousemove", this.mousemoveHandler);
    this.canvas.addEventListener("mouseup", this.mouseupHandler);
    this.canvas.addEventListener("mouseleave", this.mouseleaveHandler);
    this.canvas.addEventListener("wheel", this.wheelHandler);
    window.addEventListener("keydown", this.keydownHandler);
    window.addEventListener("keyup", this.keyupHandler);

    this.render.addEntities(entities);
    this.mouseHandler.addEntities(entities);

    this.render.startRender();
    this.mouseHandler.start();
  }

  public stop() {
    super.stop();
    this.canvas.removeEventListener("mousedown", this.mousedownHandler);
    this.canvas.removeEventListener("mousemove", this.mousemoveHandler);
    this.canvas.removeEventListener("mouseup", this.mouseupHandler);
    this.canvas.removeEventListener("mouseleave", this.mouseleaveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
    window.removeEventListener("keydown", this.keydownHandler);
    window.removeEventListener("keyup", this.keyupHandler);
    this.world.setZoom(1);
    this.world.setOffset({ x: 0, y: 0 });
  }
}
