import { BaseEntity } from "./BaseEntity";
import { SerializedBaseEntityProps } from "./types";

export class SquareEntity extends BaseEntity {
  public color: string = "#eab676";

  render(ctx: CanvasRenderingContext2D) {
    if (this.globalCompositeOperation) {
      ctx.globalCompositeOperation = this.globalCompositeOperation;
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
  }

  public serialize(): SerializedBaseEntityProps & { color: string } {
    const data = super.serialize();
    return {
      ...data,
      color: this.color,
    };
  }
}

// @ts-expect-error - override static method
SquareEntity.deserialize = (
  data: SerializedBaseEntityProps & { color: string },
): SquareEntity => {
  const entity = new SquareEntity({
    id: data.id,
    position: data.position,
    size: data.size,
    rotation: data.rotation,
    layer: data.layer,
    static: data.static,
    globalCompositeOperation: data.globalCompositeOperation,
  });

  entity.color = data.color;

  if (data.children) {
    data.children.forEach((child) => {
      entity.children.push(SquareEntity.deserialize(child));
    });
  }

  return entity;
};
