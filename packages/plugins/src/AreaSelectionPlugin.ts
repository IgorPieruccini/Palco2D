import { BaseEntity, ScenePlugin } from "@palco-2d/core";
import { BoundingBox, Vec2 } from "@palco-2d/core/types";
import { ActiveSelectionManager } from "./ActiveSelectionManager";

export class AreaSelectionPlugin extends ScenePlugin {
  private startPoint: Vec2 | null = null;
  private bounds: BoundingBox | null = null;

  init() {
    this.scene.mouseHandler.onCanvas("mousedown", this.onMouseDown.bind(this));
    this.scene.mouseHandler.onCanvas("mousemove", this.onMouseMove.bind(this));
    this.scene.mouseHandler.onCanvas("mouseup", this.onMouseUp.bind(this));
    this.scene.mouseHandler.onEntity("mouseup", this.onMouseUp.bind(this));

    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.code === "Space") {
        this.startPoint = null;
        this.bounds = null;
      }
    });
  }

  onMouseDown() {
    this.startPoint = this.scene.mouseHandler.position;
  }

  onMouseMove() {
    if (this.startPoint) {
      const endPoint = this.scene.mouseHandler.position;
      this.bounds = {
        x: Math.min(this.startPoint.x, endPoint.x),
        y: Math.min(this.startPoint.y, endPoint.y),
        width: Math.abs(this.startPoint.x - endPoint.x),
        height: Math.abs(this.startPoint.y - endPoint.y),
      };
    }
  }

  onMouseUp() {
    this.getEntitiesInBounds();
    this.startPoint = null;
    this.bounds = null;
  }

  getEntitiesInBounds() {
    if (!this.bounds) {
      return [];
    }

    const quads = [
      {
        x: this.bounds.x,
        y: this.bounds.y,
      },
      {
        x: this.bounds.x + this.bounds.width,
        y: this.bounds.y,
      },
      {
        x: this.bounds.x + this.bounds.width,
        y: this.bounds.y + this.bounds.height,
      },
      {
        x: this.bounds.x,
        y: this.bounds.y + this.bounds.height,
      },
    ];

    const quadrantsKeys =
      this.scene.mouseHandler.quadrant.getQuadrantsContainedByQuads(quads);

    for (let i = 0; i < quadrantsKeys.length; i++) {
      const key = quadrantsKeys[i];
      const entities = this.scene.mouseHandler.quadrant.quadrants.get(key);
      if (entities) {
        const layerInterator = entities.entries();
        let iteratorResult = layerInterator.next();

        while (!iteratorResult.done) {
          const [_, entity] = iteratorResult.value;
          const isInsideArea = entity.isObjectInViewport({
            position: {
              x: this.bounds.x,
              y: this.bounds.y,
            },
            size: {
              x: this.bounds.width,
              y: this.bounds.height,
            },
          });

          if (isInsideArea) {
            const isAlreayAdded = ActiveSelectionManager.selectedEntities.has(
              entity.id,
            );

            if (isAlreayAdded) {
              iteratorResult = layerInterator.next();
              continue;
            }

            this.activeSelectionHandler.addEntityToSelection(entity);
          }

          iteratorResult = layerInterator.next();
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.bounds) {
      ctx.save();
      ctx.strokeStyle = "#00c7ff";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        this.bounds.height,
      );
      ctx.fillStyle = "rgba(0, 199, 255, 0.2)";
      ctx.fillRect(
        this.bounds.x,
        this.bounds.y,
        this.bounds.width,
        this.bounds.height,
      );
      ctx.restore();
    }
  }
}
