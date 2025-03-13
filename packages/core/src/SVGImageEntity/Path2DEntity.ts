import { Path2DProps, Vec2 } from "../../types";
import { BaseEntity } from "../BaseEntity";

export class Path2DEntity extends BaseEntity {
  private path2D: Path2D;
  private fill: string;
  private stroke: string;
  private strokeWidth: number;

  constructor(props: Path2DProps) {
    super(props);
    this.path2D = new Path2D(props.coordinates);
    this.fill = props.fill;
    this.stroke = props.stroke;
    this.strokeWidth = Number.parseInt(props.strokeWidth);
  }

  /**
   * @override - Path2DEntity
   */
  isObjectInViewport(): boolean {
    return true;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.fill;
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;
    ctx.fill(this.path2D);
  }
}
