import { BaseEntity } from "./BaseEntity";
import { WorldHandler } from "./WorldHandler";
import { Vec2 } from "./types";
import {
  applyTransformation,
  getScaleFromMatrix,
  inverseTransform,
} from "./utils";

export class MouseHandler {
  private canvas: HTMLCanvasElement;
  private position: Vec2;
  private entities: BaseEntity[];
  private hoveredEntity: BaseEntity | null;
  private domRect: DOMRect;

  constructor(canvas: HTMLCanvasElement, entities: BaseEntity[]) {
    this.canvas = canvas;
    this.domRect = canvas.getBoundingClientRect();
    this.position = { x: 0, y: 0 };
    this.entities = entities;
    this.hoveredEntity = null;
  }

  binded = {
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

  private updateMousePosition(event: MouseEvent) {
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

  private onMouseDown() {
    if (!this.hoveredEntity) return;
    this.hoveredEntity.onEntityEvent.mousedown?.();
  }

  private onMouseUp() {
    if (!this.hoveredEntity) return;
    this.hoveredEntity.onEntityEvent.mouseup?.();
  }

  private dispatchEventToEntities(entities: BaseEntity[]) {
    for (let x = entities.length - 1; x >= 0; x--) {
      const entity = entities[x];

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
