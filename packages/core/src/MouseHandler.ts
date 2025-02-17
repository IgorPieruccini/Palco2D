import { BaseEntity } from "./BaseEntity";
import { WorldHandler } from "./WorldHandler";
import { Vec2 } from "../types";
import { inverseTransform } from "./utils";

export class MouseHandler {
  public position: Vec2;
  public hoveredEntities: BaseEntity[];
  private canvas: HTMLCanvasElement;
  private entities: BaseEntity[];
  private domRect: DOMRect;
  private canvasEventSubscribers: Map<"mouseup" | "mousedown", Function[]> =
    new Map();
  private shouldStopPropagation = false;

  constructor(canvas: HTMLCanvasElement, entities: BaseEntity[]) {
    this.canvas = canvas;
    this.domRect = canvas.getBoundingClientRect();
    this.position = { x: 0, y: 0 };
    this.entities = entities;
    this.hoveredEntities = [];
  }

  private binded = {
    updateMousePosition: this.updateMousePosition.bind(this),
    onMouseDown: this.onMouseDown.bind(this),
    onMouseUp: this.onMouseUp.bind(this),
  };

  public start() {
    this.canvas.addEventListener("mousemove", this.binded.updateMousePosition);
    this.canvas.addEventListener("mousedown", this.binded.onMouseDown);
    this.canvas.addEventListener("mouseup", this.binded.onMouseUp);
  }

  public stop() {
    this.canvas.removeEventListener(
      "mousemove",
      this.binded.updateMousePosition,
    );
    this.canvas.removeEventListener("mousedown", this.binded.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.binded.onMouseUp);
    this.entities = [];
    this.hoveredEntities = [];
  }

  public addEntity(entity: BaseEntity) {
    this.entities.push(entity);
  }

  public addEntities(entities: BaseEntity[]) {
    this.entities = [...this.entities, ...entities];
  }

  public removeEntity(entity: BaseEntity, shiftIndex?: number) {
    let index = entity.getInteractionIndex();

    if (index === null) return;

    if (shiftIndex) {
      index -= shiftIndex;
    }

    const entityIsHovered = this.hoveredEntities.find(
      (e) => e.id === entity.id,
    );
    if (entityIsHovered) {
      this.hoveredEntities = this.hoveredEntities.filter(
        (e) => e.id !== entity.id,
      );
    }

    if (entity.parent) {
      entity.parent.removeChild(index);
      return;
    }

    this.entities.splice(index, 1);
  }

  public removeEntities(entities: BaseEntity[]) {
    let removedIndex = 0;

    for (let x = 0; x < entities.length; x++) {
      this.removeEntity(entities[x], removedIndex);
      removedIndex++;
    }
  }

  private updateMousePosition(event: MouseEvent) {
    event.stopPropagation();
    const position = {
      x: event.clientX - this.domRect.x,
      y: event.clientY - this.domRect.y,
    };

    const offset = WorldHandler().getOffset();
    const scale = WorldHandler().getZoom();

    const transformedPosition = inverseTransform(position, [
      [scale, 0, offset.x],
      [0, scale, offset.y],
      [0, 0, 1],
    ]);

    this.position = transformedPosition;

    this.dispatchEventToEntities(this.entities);
  }

  private onMouseDown(ev: MouseEvent) {
    ev.stopPropagation();
    if (this.hoveredEntities.length === 0) {
      this.canvasEventSubscribers.get("mousedown")?.forEach((callback) => {
        callback();
      });
      return;
    }

    this.hoveredEntities.reverse().forEach((entity) => {
      if (this.shouldStopPropagation) return;
      entity.onEntityEvent.mousedown?.(this.stopPropagation.bind(this));
    });
  }

  private onMouseUp(ev: MouseEvent) {
    ev.stopPropagation();
    if (this.hoveredEntities.length === 0) {
      this.canvasEventSubscribers.get("mouseup")?.forEach((callback) => {
        callback();
      });
      return;
    }

    this.hoveredEntities.reverse().forEach((entity) => {
      if (this.shouldStopPropagation) return;
      entity.onEntityEvent.mouseup?.(this.stopPropagation.bind(this));
    });
  }

  private stopPropagation() {
    this.shouldStopPropagation = true;
  }

  private dispatchEventToEntities(entities: BaseEntity[]) {
    this.shouldStopPropagation = false;
    const offset = WorldHandler().getOffset();
    const zoom = WorldHandler().getZoom();

    for (let x = 0; x <= this.entities.length - 1; x++) {
      if (this.shouldStopPropagation) {
        break;
      }
      const entity = entities[x];

      const viewportPosition = {
        x: -offset.x / zoom,
        y: -offset.y / zoom,
      };

      const viewportSize = {
        x: this.canvas.clientWidth / zoom,
        y: this.canvas.clientHeight / zoom,
      };

      const isInViewPort = entity.isObjectInViewport({
        position: viewportPosition,
        size: viewportSize,
      });

      if (!isInViewPort) {
        continue;
      }

      entity.setInteractionIndex(x);

      if (entity.children.length > 0) {
        this.dispatchEventToEntities(entity.children);
      }

      const isMouseOver = entity.isPointOverEntity(this.position);
      const wasMouseOver = this.hoveredEntities.find((e) => e.id === entity.id);

      if (!isMouseOver && wasMouseOver) {
        entity?.onEntityEvent.mouseleave?.(this.stopPropagation.bind(this));

        this.hoveredEntities = this.hoveredEntities.filter(
          (e) => e.id !== entity.id,
        );
      }

      if (isMouseOver) {
        if (!wasMouseOver) {
          entity.onEntityEvent.mouseenter?.(this.stopPropagation.bind(this));
          this.hoveredEntities.push(entity);
        }

        entity.onEntityEvent.mousehover?.(this.stopPropagation.bind(this));
      }
    }
  }

  public onCanvas(event: "mouseup" | "mousedown", callback: Function) {
    const events = this.canvasEventSubscribers.get(event) || [];
    this.canvasEventSubscribers.set(event, [...events, callback]);
  }
}
