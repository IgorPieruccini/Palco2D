import { BaseEntity } from "./BaseEntity";
import { BaseEntityProps, SerializedBaseEntityProps } from "../types";

export class SquareEntity extends BaseEntity {
  public color: string = "#eab676";

  constructor(props: BaseEntityProps & { color?: string }) {
    super(props);
    if (props.color) {
      this.color = props.color;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);

    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
  }

  public serialize(): SerializedBaseEntityProps & { color: string } {
    const data = super.serialize();
    return {
      ...data,
      type: "squareEntity",
      color: this.color,
    };
  }
}
