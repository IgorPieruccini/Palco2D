import { Path2DProps, SVGData, Vec2 } from "../../types";
import { BaseEntity } from "../BaseEntity";

export class Path2DEntity extends BaseEntity {
  private svgData: SVGData;

  constructor(props: Path2DProps) {
    super(props);
    this.svgData = props.svgData;
  }

  /**
   * @override - Path2DEntity
   */
  isObjectInViewport(): boolean {
    return true;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.svgData.fill;
    ctx.strokeStyle = this.svgData.stroke;
    ctx.lineWidth = this.svgData.strokeWidth;
    ctx.fill(this.svgData.coordinates);
  }
}
