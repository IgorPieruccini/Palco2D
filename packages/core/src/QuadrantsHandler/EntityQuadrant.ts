import { BaseEntity } from "../BaseEntity";

export class EntityQuadrant {
  protected quadrant: Map<string, string>;
  protected entity: BaseEntity;

  protected matrix: number[][];
  public shouldUpdate: boolean = true;

  constructor(entity: BaseEntity) {
    this.matrix = entity.getWorldMatrix();
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
    if (this.shouldUpdate) {
      this.entity.children.forEach((layer) => {
        layer.forEach((child) => {
          child.quadrant.shouldUpdate = true;
        });
      });
      return true;
    }
    const entityMatrix = this.entity.matrix;

    const needToUpdate = entityMatrix.some((row, i) => {
      return row.some((cell, j) => {
        return cell !== this.matrix[i][j];
      });
    });

    if (needToUpdate) {
      this.matrix = entityMatrix;
      this.entity.children.forEach((layer) => {
        layer.forEach((child) => {
          child.quadrant.shouldUpdate = true;
        });
      });
    }

    return needToUpdate;
  }
}
