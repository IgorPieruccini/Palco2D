import { BaseEntity } from "../BaseEntity";
import { EntityPlugin } from "../EntityPlugin";
import { SceneHandler } from "../SceneHandler/SceneHandler";
import { WorldHandler } from "../WorldHandler";

export class EnityBoundariesPlugin extends EntityPlugin {
  private isDragging: boolean = false;
  private startDragPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(entity: BaseEntity, key: string) {
    super(entity, key);
    this.addControllers();
  }

  private addControllers() {
    const controler = new BaseEntity({
      position: {
        x: this.entity.position.x - this.entity.size.x / 2,
        y: this.entity.position.y,
      },
      size: { x: 10, y: 30 },
      rotation: 0,
      layer: 1000,
    });

    controler.render = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#91AEC1";
      const zoom = WorldHandler().getZoom();
      ctx.beginPath();
      ctx.roundRect(
        -controler.size.x / 2 / zoom,
        -controler.size.y / 2 / zoom,
        controler.size.x / zoom,
        controler.size.y / zoom,
        5,
      );
      ctx.fill();
      ctx.closePath();
    };

    const onDrag = () => {
      if (this.isDragging) {
        const delta = {
          x:
            SceneHandler.currentScene!.mouseHandler.position.x -
            this.startDragPosition.x,
          y:
            SceneHandler.currentScene!.mouseHandler.position.y -
            this.startDragPosition.y,
        };

        const mousePosition = SceneHandler.currentScene!.mouseHandler.position;

        this.entity.size = {
          x: this.entity.size.x - delta.x * 2,
          y: this.entity.size.y,
        };

        controler.position = {
          x: mousePosition.x,
          y: controler.position.y,
        };
        this.startDragPosition = mousePosition;
      }
    };

    controler.on("mousedown", () => {
      this.isDragging = true;
      this.startDragPosition = SceneHandler.currentScene!.mouseHandler.position;
      SceneHandler.currentScene?.canvas.addEventListener("mousemove", onDrag);
    });

    controler.on("mouseup", () => {
      SceneHandler.currentScene?.canvas.removeEventListener(
        "mousemove",
        onDrag,
      );
      this.isDragging = false;
    });

    controler.on("mouseenter", () => {
      const scene = SceneHandler.currentScene;
      if (scene) {
        scene.canvas.style.cursor = "ew-resize";
      }
    });

    controler.on("mouseleave", () => {
      const scene = SceneHandler.currentScene;
      if (scene) {
        scene.canvas.style.cursor = "default";
      }
    });

    SceneHandler.currentScene?.render.addEntity(controler);
    SceneHandler.currentScene?.mouseHandler.addEntity(controler);
  }

  public render(ctx: CanvasRenderingContext2D) {
    const { size } = this.entity;

    const zoom = WorldHandler().getZoom();

    ctx.strokeStyle = "#91AEC1";
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(-size.x / 2, -size.y / 2, size.x, size.y);
  }
}
