import { BaseEntity } from "./BaseEntity";
import { Vec2 } from "./types";
import { getScaleFromMatrix } from "./utils";

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

  public start() {
    this.canvas.addEventListener('mousemove', this.updateMousePosition.bind(this));
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  public stop() {
    removeEventListener('mousemove', this.updateMousePosition.bind(this));
    removeEventListener('mousedown', this.onMouseDown.bind(this));
    removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.entities = [];
  }

  public addEntity(entity: BaseEntity) {
    this.entities.push(entity);
  }

  public addEntities(entities: BaseEntity[]) {
    this.entities = [...this.entities, ...entities];
  }

  private updateMousePosition(event: MouseEvent) {
    this.position = { x: event.clientX - this.domRect.x, y: event.clientY - this.domRect.y };
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

  private isMouseOverEntity(entity: BaseEntity) {
    const { size } = entity;

    const relativeMousePosition = entity.getRelativePostion(this.position);

    const matrix = entity.getMatrix();
    const globalScale = getScaleFromMatrix(matrix);

    const mousePos = {
      x: relativeMousePosition.x,
      y: relativeMousePosition.y,
    }

    return (
      (-size.x * globalScale.x) / 2 <= mousePos.x &&
      (size.x * globalScale.x) / 2 >= mousePos.x &&
      (-size.y * globalScale.y) / 2 <= mousePos.y &&
      (size.y * globalScale.y) / 2 >= mousePos.y
    );
  }

  private dispatchEventToEntities(entities: BaseEntity[]) {
    for (let x = entities.length - 1; x >= 0; x--) {
      const entity = entities[x];

      if (entity.children.length > 0) {
        this.dispatchEventToEntities(
          entity.children,
        );
      }

      const isMouseOver = this.isMouseOverEntity(entity);

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
