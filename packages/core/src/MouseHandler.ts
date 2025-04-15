import { BaseEntity } from "./BaseEntity";
import { WorldHandler } from "./WorldHandler";
import { Vec2 } from "../types";
import { inverseTransform } from "./utils";
import { QuadrantsHandler } from "./QuadrantsHandler/QuadrantsHandler";

export class MouseHandler {
  public position: Vec2;
  public hoveredEntities: BaseEntity[];
  public quadrant: QuadrantsHandler;
  private canvas: HTMLCanvasElement;
  private domRect: DOMRect;
  private canvasEventSubscribers: Map<
    "mouseup" | "mousedown" | "mousemove" | "dblclick",
    Array<() => void>
  > = new Map();

  private entityEventSubscribers: Map<
    "mouseup" | "mousedown",
    Array<(entity: BaseEntity) => void>
  > = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.domRect = canvas.getBoundingClientRect();
    this.position = { x: 0, y: 0 };
    this.hoveredEntities = [];
    this.quadrant = new QuadrantsHandler();
  }

  private binded = {
    updateMousePosition: this.updateMousePosition.bind(this),
    onMouseDown: this.onMouseDown.bind(this),
    onMouseUp: this.onMouseUp.bind(this),
    onDoubleClick: this.onDoubleClick.bind(this),
  };

  public start() {
    this.canvas.addEventListener("mousemove", this.binded.updateMousePosition);
    this.canvas.addEventListener("mousedown", this.binded.onMouseDown);
    this.canvas.addEventListener("mouseup", this.binded.onMouseUp);
    this.canvas.addEventListener("dblclick", this.binded.onDoubleClick);
  }

  public stop() {
    this.pause();
    this.quadrant.quadrants.clear();
  }

  public pause() {
    this.canvas.removeEventListener(
      "mousemove",
      this.binded.updateMousePosition,
    );
    this.canvas.removeEventListener("mousedown", this.binded.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.binded.onMouseUp);
    this.canvas.removeEventListener("dblclick", this.binded.onDoubleClick);
    this.hoveredEntities = [];
  }

  /**
   * Remove entity from all quadrants
   */
  public removeEntity(entity: BaseEntity) {
    const currentEntityQuadrant = entity.quadrant.getQuadrant();

    const iterator = currentEntityQuadrant.entries();
    let iteratorResult = iterator.next();

    while (!iteratorResult.done) {
      const [_, quad] = iteratorResult.value;
      this.quadrant.quadrants.get(quad)?.delete(entity.id);
      iteratorResult = iterator.next();
    }

    this.hoveredEntities = [];
  }

  private updateMousePosition(event: MouseEvent) {
    event.stopPropagation();
    const position = {
      x: event.clientX - this.domRect.x,
      y: event.clientY - this.domRect.y,
    };

    const offset = WorldHandler.getOffset();
    const scale = WorldHandler.getZoom();

    const transformedPosition = inverseTransform(position, [
      [scale, 0, offset.x],
      [0, scale, offset.y],
      [0, 0, 1],
    ]);

    this.position = {
      x: transformedPosition.x + window.scrollX,
      y: transformedPosition.y + window.scrollY,
    };

    this.dispatchEventToEntities();

    this.canvasEventSubscribers.get("mousemove")?.forEach((callback) => {
      callback();
    });
  }

  private getTopLayerHoveredEntity() {
    return this.hoveredEntities.sort((a, b) => {
      if (a.isUI && !b.isUI) {
        return 1;
      }

      if (!a.isUI && b.isUI) {
        return -1;
      }

      return b.layer - a.layer;
    })[0];
  }

  private onMouseDown(ev: MouseEvent) {
    ev.stopPropagation();
    if (this.hoveredEntities.length === 0) {
      this.canvasEventSubscribers.get("mousedown")?.forEach((callback) => {
        callback();
      });
      return;
    }

    const topLayerHoveredEntity = this.getTopLayerHoveredEntity();
    topLayerHoveredEntity.onEntityEvent.get("mousedown")?.forEach((cb) => cb());

    this.entityEventSubscribers.get("mousedown")?.forEach((callback) => {
      callback(topLayerHoveredEntity);
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

    const topLayerHoveredEntity = this.getTopLayerHoveredEntity();
    topLayerHoveredEntity.onEntityEvent.get("mouseup")?.forEach((cb) => cb());

    this.entityEventSubscribers.get("mouseup")?.forEach((callback) => {
      callback(topLayerHoveredEntity);
    });
  }

  private onDoubleClick(ev: MouseEvent) {
    ev.stopPropagation();
    if (this.hoveredEntities.length === 0) {
      return;
    }

    this.getTopLayerHoveredEntity()
      .onEntityEvent.get("dblclick")
      ?.forEach((cb) => cb());
  }

  private dispatchEventToEntities(lastActiveQuadrant: string | null = null) {
    const offset = WorldHandler.getOffset();
    const zoom = WorldHandler.getZoom();

    const mouseQuadrant = lastActiveQuadrant
      ? { x: 0, y: 0 }
      : this.quadrant.getPointQuadrant(this.position);

    const quadrantKey =
      lastActiveQuadrant || `${mouseQuadrant.x},${mouseQuadrant.y}`;

    if (
      this.quadrant.lastMouseQuadrant !== quadrantKey &&
      !lastActiveQuadrant
    ) {
      const t = this.quadrant.lastMouseQuadrant;
      this.quadrant.lastMouseQuadrant = quadrantKey;
      this.dispatchEventToEntities(t);
    }
    const currentQuadrant = this.quadrant.quadrants.get(quadrantKey);

    if (!currentQuadrant) {
      return;
    }

    const iterator = currentQuadrant.entries();
    let iteratorResult = iterator.next();

    while (!iteratorResult.done) {
      const [_, entity] = iteratorResult.value;

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
        iteratorResult = iterator.next();
        return;
      }

      const isMouseOver = entity.isPointOverEntity(this.position);
      const wasMouseOver = this.hoveredEntities.find((e) => e.id === entity.id);

      if (!isMouseOver && wasMouseOver) {
        entity?.onEntityEvent.get("mouseleave")?.forEach((cb) => cb());

        this.hoveredEntities = this.hoveredEntities.filter(
          (e) => e.id !== entity.id,
        );
      }

      if (isMouseOver) {
        if (!wasMouseOver) {
          entity.onEntityEvent.get("mouseenter")?.forEach((cb) => cb());
          this.hoveredEntities.push(entity);
        }

        entity.onEntityEvent.get("mouseenter")?.forEach((cb) => cb());
      }

      iteratorResult = iterator.next();
    }
  }

  /**
   * Subscribe to clicking on the canvas where no entity is hovered.
   */
  public onCanvas(
    event: "mouseup" | "mousedown" | "mousemove",
    callback: () => void,
  ) {
    const events = this.canvasEventSubscribers.get(event) || [];
    this.canvasEventSubscribers.set(event, [...events, callback]);
  }

  public onEntity(
    event: "mouseup" | "mousedown",
    callback: (entity: BaseEntity) => void,
  ) {
    const events = this.entityEventSubscribers.get(event) || [];
    this.entityEventSubscribers.set(event, [...events, callback]);
  }
}
