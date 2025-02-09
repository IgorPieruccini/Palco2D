import { BaseEntity } from "./BaseEntity";
import { WorldHandler } from "./WorldHandler";
import { Vec2 } from "./types";
import { inverseTransform } from "./utils";

export class MouseHandler {
  public position: Vec2;
  public hoveredEntity: BaseEntity | null;
  private canvas: HTMLCanvasElement;
  private entities: BaseEntity[];
  private domRect: DOMRect;

  constructor(canvas: HTMLCanvasElement, entities: BaseEntity[]) {
    this.canvas = canvas;
    this.domRect = canvas.getBoundingClientRect();
    this.position = { x: 0, y: 0 };
    this.entities = entities;
    this.hoveredEntity = null;
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
    this.hoveredEntity = null;
  }

  public addEntity(entity: BaseEntity) {
    this.entities.push(entity);
  }

  public addEntities(entities: BaseEntity[]) {
    this.entities = [...this.entities, ...entities];
  }

  public removeEntity(entity: BaseEntity) {
    const index = entity.getInteractionIndex();

    if (index === null) return;

    if (this.hoveredEntity?.id === entity.id) {
      this.hoveredEntity = null;
    }

    if (entity.parent) {
      entity.parent.removeChild(index);
      return;
    }

    this.entities.splice(index, 1);
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
    if (!this.hoveredEntity) return;
    this.hoveredEntity.onEntityEvent.mousedown?.();
  }

  private onMouseUp(ev: MouseEvent) {
    ev.stopPropagation();
    if (!this.hoveredEntity) return;
    this.hoveredEntity.onEntityEvent.mouseup?.();
  }

  private dispatchEventToEntities(entities: BaseEntity[]) {
    for (let x = entities.length - 1; x >= 0; x--) {
      const entity = entities[x];

      entity.setInteractionIndex(x);

      if (entity.children.length > 0) {
        this.dispatchEventToEntities(entity.children);
      }

      const isMouseOver = entity.isPointOverEntity(this.position);

      if (!isMouseOver && this.hoveredEntity?.id === entity.id) {
        entity?.onEntityEvent.mouseleave?.();

        this.hoveredEntity = null;
      }

      if (isMouseOver) {
        if (this.hoveredEntity?.id !== entity.id && !this.hoveredEntity) {
          entity.onEntityEvent.mouseenter?.();
          this.hoveredEntity = entity;
        }

        entity.onEntityEvent.mousehover?.();
      }
    }
  }
}
