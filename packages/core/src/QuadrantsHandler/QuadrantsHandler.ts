import { Vec2 } from "../../types";
import { BaseEntity } from "../BaseEntity";

const DEFAULT_QUADRANT_SIZE = 300;

type Quadrant = Map<string, BaseEntity>;
type Quadrants = Map<string, Quadrant>;

export class QuadrantsHandler {
  quadrants: Quadrants = new Map();

  constructor() { }

  // TODO: Static entity / Entity larger than quadrant / dispatch event if current entity quadrant is not in scope
  public updateQuadrants(entity: BaseEntity) {
    const currentEntityQuadrant = entity.quadrant.getQuadrant();

    currentEntityQuadrant.forEach((quad) => {
      this.quadrants.get(quad)?.delete(entity.id);
    });

    const coords = entity.getCoords();

    for (const quad of coords) {
      const key = `${Math.floor(quad.x / DEFAULT_QUADRANT_SIZE)},${Math.floor(quad.y / DEFAULT_QUADRANT_SIZE)}`;
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
}
