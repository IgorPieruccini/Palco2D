import { BaseEntity } from "../BaseEntity";

const DEFAULT_QUADRANT_SIZE = 300;

type Quadrant = Map<string, BaseEntity>;
type Quadrants = Map<string, Quadrant>;

export class QuadrantsHandler {
  quadrants: Quadrants = new Map();

  constructor() { }

  public updateQuadrants(entity: BaseEntity) {
    const currentEntityQuadrant = entity.quadrant.getQuadrant();

    currentEntityQuadrant.forEach((quad) => {
      this.quadrants.get(quad)?.delete(entity.id);
    });

    // check if entity is in quadrant

    // Wont work for rotated entities
    // Wont work for entities that are bigger than the quadrant size
    const halfWidth = entity.size.x / 2;
    const halfHeight = entity.size.y / 2;

    const topLeft = {
      x: Math.floor((entity.position.x - halfWidth) / DEFAULT_QUADRANT_SIZE),
      y: Math.floor((entity.position.y - halfHeight) / DEFAULT_QUADRANT_SIZE),
    };

    const topRight = {
      x: Math.floor((entity.position.x + halfWidth) / DEFAULT_QUADRANT_SIZE),
      y: Math.floor((entity.position.y - halfHeight) / DEFAULT_QUADRANT_SIZE),
    };

    const bottomLeft = {
      x: Math.floor((entity.position.x - halfWidth) / DEFAULT_QUADRANT_SIZE),
      y: Math.floor((entity.position.y + halfHeight) / DEFAULT_QUADRANT_SIZE),
    };

    const bottomRight = {
      x: Math.floor((entity.position.x + halfWidth) / DEFAULT_QUADRANT_SIZE),
      y: Math.floor((entity.position.y + halfHeight) / DEFAULT_QUADRANT_SIZE),
    };

    const points = [topLeft, topRight, bottomLeft, bottomRight];

    for (const quad of points) {
      const key = `${quad.x},${quad.y}`;
      entity.quadrant.updateQuadrant(key);

      if (!this.quadrants.has(key)) {
        this.quadrants.set(key, new Map());
      }

      this.quadrants.get(key)?.set(entity.id, entity);
    }
  }
}
