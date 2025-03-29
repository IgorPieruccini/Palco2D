import { Vec2 } from "../../types";
import { BaseEntity } from "../BaseEntity";

const DEFAULT_QUADRANT_SIZE = 300;

type Quadrant = Map<string, BaseEntity>;
type Quadrants = Map<string, Quadrant>;

export class QuadrantsHandler {
  public quadrants: Quadrants = new Map();
  public lastMouseQuadrant: string | null = null;

  public updateQuadrants(entity: BaseEntity) {
    if (entity.getStatic()) return;

    const currentEntityQuadrant = entity.quadrant.getQuadrant();

    currentEntityQuadrant.forEach((quad) => {
      this.quadrants.get(quad)?.delete(entity.id);
    });

    const keys = this.getQuadrantsContainedByQuads(entity.coords.corners);

    for (const key of keys) {
      entity.quadrant.updateQuadrant(key);
      if (!this.quadrants.has(key)) {
        this.quadrants.set(key, new Map());
      }

      this.quadrants.get(key)?.set(entity.id, entity);
    }
  }

  public getPointQuadrant(point: Vec2) {
    return {
      x: Math.floor(point.x / DEFAULT_QUADRANT_SIZE),
      y: Math.floor(point.y / DEFAULT_QUADRANT_SIZE),
    };
  }

  private getQuadrantsContainedByQuads(quads: Vec2[]) {
    const mapKeys: Map<string, string> = new Map();

    for (let i = 0; i < quads.length; i++) {
      const baseQuad = quads[i];
      const quad = quads[i + 1] || quads[0];
      const vectorDistance = {
        x: quad.x - baseQuad.x,
        y: quad.y - baseQuad.y,
      };

      const dividedDistance = {
        x: Math.floor(vectorDistance.x / DEFAULT_QUADRANT_SIZE),
        y: Math.floor(vectorDistance.y / DEFAULT_QUADRANT_SIZE),
      };

      const firstQuadQuadrant = {
        x: Math.floor(baseQuad.x / DEFAULT_QUADRANT_SIZE),
        y: Math.floor(baseQuad.y / DEFAULT_QUADRANT_SIZE),
      };

      let x = 0;
      let y = 0;
      const xDirection = dividedDistance.x < 0 ? -1 : 1;
      const yDirection = dividedDistance.y < 0 ? -1 : 1;

      while (
        xDirection === -1 ? x >= dividedDistance.x : x <= dividedDistance.x
      ) {
        while (
          yDirection === -1 ? y >= dividedDistance.y : y <= dividedDistance.y
        ) {
          mapKeys.set(
            `${Math.floor(firstQuadQuadrant.x + x)},${Math.floor(firstQuadQuadrant.y + y)}`,
            `${Math.floor(firstQuadQuadrant.x + x)},${Math.floor(firstQuadQuadrant.y + y)}`,
          );
          y += yDirection;
        }
        x += xDirection;
        y = 0;
      }
    }

    return Array.from(mapKeys.keys());
  }
}
