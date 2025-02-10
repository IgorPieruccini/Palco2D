import { BaseEntity } from "../BaseEntity";
import { SceneHandler } from "../SceneHandler/SceneHandler";
import { WorldHandler } from "../WorldHandler";
import { BaseEntityProps } from "../types";

export type ControllerType = "ml" | "mt" | "mb" | "mr";
type BoundControllerProps = BaseEntityProps & {
  type: ControllerType;
  connectedEntity: BaseEntity;
};

export class BoundController extends BaseEntity {
  type: ControllerType;
  isDragging: boolean = false;
  startDragPosition: { x: number; y: number } = { x: 0, y: 0 };
  connectedEntity: BaseEntity;

  constructor(props: BoundControllerProps) {
    const { type, connectedEntity, ...rest } = props;

    super(rest);
    this.type = type;
    this.connectedEntity = connectedEntity;
    this.addEvents();

    WorldHandler().subscribeToZoomUpdate((zoom: number) => {
      this.size = {
        x: rest.size.x / zoom,
        y: rest.size.y / zoom,
      };
    });
  }

  addEvents() {
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

        const newSize = () => {
          switch (this.type) {
            case "ml":
              return {
                x: this.connectedEntity.size.x - delta.x,
                y: this.connectedEntity.size.y,
              };
            case "mt":
              return {
                x: this.connectedEntity.size.x,
                y: this.connectedEntity.size.y - delta.y,
              };
            case "mb":
              return {
                x: this.connectedEntity.size.x,
                y: this.connectedEntity.size.y + delta.y,
              };
            case "mr":
              return {
                x: this.connectedEntity.size.x + delta.x,
                y: this.connectedEntity.size.y,
              };
          }
        };

        const newEntityPosition = () => {
          switch (this.type) {
            case "ml":
              return {
                x: this.connectedEntity.position.x + delta.x / 2,
                y: this.connectedEntity.position.y,
              };
            case "mt":
              return {
                x: this.connectedEntity.position.x,
                y: this.connectedEntity.position.y + delta.y / 2,
              };
            case "mb":
              return {
                x: this.connectedEntity.position.x,
                y: this.connectedEntity.position.y + delta.y / 2,
              };
            case "mr":
              return {
                x: this.connectedEntity.position.x + delta.x / 2,
                y: this.connectedEntity.position.y,
              };
          }
        };

        const newControllerPosition = () => {
          switch (this.type) {
            case "ml":
            case "mr":
              return {
                x: mousePosition.x,
                y: this.position.y,
              };
            case "mt":
            case "mb":
              return {
                x: this.position.x,
                y: mousePosition.y,
              };
          }
        };

        this.connectedEntity.size = newSize();
        this.connectedEntity.position = newEntityPosition();
        this.position = newControllerPosition();

        this.startDragPosition = mousePosition;
      }
    };

    const getCursorByType = () => {
      switch (this.type) {
        case "ml":
        case "mr":
          return "ew-resize";
        case "mt":
        case "mb":
          return "ns-resize";
      }
    };

    this.on("mousedown", () => {
      this.isDragging = true;
      this.startDragPosition = SceneHandler.currentScene!.mouseHandler.position;
      SceneHandler.currentScene?.canvas.addEventListener("mousemove", onDrag);
    });

    this.on("mouseup", () => {
      SceneHandler.currentScene?.canvas.removeEventListener(
        "mousemove",
        onDrag,
      );
      this.isDragging = false;
    });

    this.on("mouseenter", () => {
      const scene = SceneHandler.currentScene;
      if (scene) {
        scene.canvas.style.cursor = getCursorByType();
      }
    });

    this.on("mouseleave", () => {
      const scene = SceneHandler.currentScene;
      if (scene) {
        scene.canvas.style.cursor = "default";
      }
    });
  }

  private updatePosition() {
    switch (this.type) {
      case "ml":
        this.position = {
          x: this.connectedEntity.position.x - this.connectedEntity.size.x / 2,
          y: this.connectedEntity.position.y,
        };
        break;
      case "mt":
        this.position = {
          x: this.connectedEntity.position.x,
          y: this.connectedEntity.position.y - this.connectedEntity.size.y / 2,
        };
        break;
      case "mb":
        this.position = {
          x: this.connectedEntity.position.x,
          y: this.connectedEntity.position.y + this.connectedEntity.size.y / 2,
        };
        break;
      case "mr":
        this.position = {
          x: this.connectedEntity.position.x + this.connectedEntity.size.x / 2,
          y: this.connectedEntity.position.y,
        };
        break;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isDragging) {
      this.updatePosition();
    }
    const zoom = WorldHandler().getZoom();
    ctx.fillStyle = "#91AEC1";
    ctx.beginPath();
    ctx.roundRect(
      -this.size.x / 2,
      -this.size.y / 2,
      this.size.x,
      this.size.y,
      5 / zoom,
    );
    ctx.fill();
    ctx.closePath();
  }
}
