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
  private canvasEventSubscribers: Map<"mouseup" | "mousedown", Function[]> =
    new Map();

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
  };

  public start() {
    this.canvas.addEventListener("mousemove", this.binded.updateMousePosition);
    this.canvas.addEventListener("mousedown", this.binded.onMouseDown);
    this.canvas.addEventListener("mouseup", this.binded.onMouseUp);
  }

  public stop() {
    this.puase();
    this.quadrant.quadrants.clear();
  }

  public puase() {
    this.canvas.removeEventListener(
      "mousemove",
      this.binded.updateMousePosition,
    );
    this.canvas.removeEventListener("mousedown", this.binded.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.binded.onMouseUp);
    this.hoveredEntities = [];
  }

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

    const offset = WorldHandler().getOffset();
    const scale = WorldHandler().getZoom();

    const transformedPosition = inverseTransform(position, [
      [scale, 0, offset.x],
      [0, scale, offset.y],
      [0, 0, 1],
    ]);

    this.position = transformedPosition;

    this.dispatchEventToEntities();
  }

  private getTopLayerHoveredEntity() {
    return this.hoveredEntities.reduce((prev, current) => {
      const prevRenderIndex = prev.getIndex() || 0;
      const currentRenderIndex = current.getIndex() || 0;
      return currentRenderIndex < prevRenderIndex ? prev : current;
    }, this.hoveredEntities[0]);
  }

  private onMouseDown(ev: MouseEvent) {
    ev.stopPropagation();
    if (this.hoveredEntities.length === 0) {
      this.canvasEventSubscribers.get("mousedown")?.forEach((callback) => {
        callback();
      });
      return;
    }

    this.getTopLayerHoveredEntity().onEntityEvent.mousedown?.();
  }

  private onMouseUp(ev: MouseEvent) {
    ev.stopPropagation();
    if (this.hoveredEntities.length === 0) {
      this.canvasEventSubscribers.get("mouseup")?.forEach((callback) => {
        callback();
      });
      return;
    }

    this.getTopLayerHoveredEntity().onEntityEvent.mouseup?.();
  }

  private dispatchEventToEntities() {
    const offset = WorldHandler().getOffset();
    const zoom = WorldHandler().getZoom();

    const mouseQuadrant = this.quadrant.getPointQuadrant(this.position);
    const quadrantKey = `${mouseQuadrant.x},${mouseQuadrant.y}`;
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
        x: this.canvas.width / zoom,
        y: this.canvas.height / zoom,
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
        entity?.onEntityEvent.mouseleave?.();

        this.hoveredEntities = this.hoveredEntities.filter(
          (e) => e.id !== entity.id,
        );
      }

      if (isMouseOver) {
        if (!wasMouseOver) {
          entity.onEntityEvent.mouseenter?.();
          this.hoveredEntities.push(entity);
        }

        entity.onEntityEvent.mousehover?.();
      }

      iteratorResult = iterator.next();
    }
  }

  public onCanvas(event: "mouseup" | "mousedown", callback: Function) {
    const events = this.canvasEventSubscribers.get(event) || [];
    this.canvasEventSubscribers.set(event, [...events, callback]);
  }
}
