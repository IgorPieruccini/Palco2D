import { Vec2 } from "../../types";
import { BaseEntity } from "../BaseEntity";

export class EntityQuadrant {
  protected quadrant: Map<string, string>;
  protected prevPosition: Vec2;
  protected prevSize: Vec2;
  protected prevRotation: number;
  protected entity: BaseEntity;

  constructor(entity: BaseEntity) {
    this.prevPosition = entity.position;
    this.prevSize = entity.size;
    this.prevRotation = entity.rotation;
    this.entity = entity;
    this.quadrant = new Map();
  }

  public updateQuadrant(quad: string) {
    this.quadrant.set(quad, quad);
  }

  public getQuadrant() {
    return this.quadrant;
  }

  public needToUpdateQuadrant() {
    const needToUpdate =
      this.prevPosition.x !== this.entity.position.x ||
      this.prevPosition.y !== this.entity.position.y ||
      this.prevSize.x !== this.entity.size.x ||
      this.prevSize.y !== this.entity.size.y ||
      this.prevRotation !== this.entity.rotation;

    if (needToUpdate) {
      this.prevPosition = this.entity.position;
      this.prevSize = this.entity.size;
      this.prevRotation = this.entity.rotation;
    }

    return needToUpdate;
  }
}
