import { BaseEntity } from "./BaseEntity";

export class EntityPlugin {
  public entity: BaseEntity;
  public key: string;

  constructor(entity: BaseEntity, key: string) {
    this.entity = entity;
    this.key = key;
  }

  public render(ctx: CanvasRenderingContext2D) {}

  public destroy() {}
}
