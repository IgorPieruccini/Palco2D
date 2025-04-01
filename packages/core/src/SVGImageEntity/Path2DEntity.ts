import { BoundingBox, Path2DProps, SVGData, Vec2 } from "../../types";
import { BaseEntity } from "../BaseEntity";
import { calculateSVGBoundingBox } from "./utils";

export class Path2DEntity extends BaseEntity {
  private svgData: SVGData;
  private pathBoundingBox: BoundingBox = {
    x: Infinity,
    y: Infinity,
    width: Infinity,
    height: Infinity,
  };

  public initialPosition: Vec2 = { x: 0, y: 0 };

  constructor(props: Path2DProps) {
    const bounds = calculateSVGBoundingBox([props.svgData]);

    const position = {
      x: -props.offset.x + bounds.x + bounds.width / 2,
      y: -props.offset.y + bounds.y + bounds.height / 2,
    };

    const size = {
      x: bounds.width,
      y: bounds.height,
    };

    super({ ...props, position, size });
    this.svgData = props.svgData;
    this.initialPosition = { ...position };
    this.pathBoundingBox = bounds;
  }

  /**
   * @override - Path2DEntity
   */
  isObjectInViewport(): boolean {
    return true;
  }

  /**
   * Updates the bounding box of the path based on the current SVGData.
   * @override - BaseEntity
   */
  public updateBoundingBox() {
    const bounds = calculateSVGBoundingBox([this.svgData]);
    this.pathBoundingBox = bounds;
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);

    const data = this.svgData;

    ctx.save();

    // Center the SVGImageEntity in the middle
    ctx.translate(
      -this.pathBoundingBox.x - this.pathBoundingBox.width / 2,
      -this.pathBoundingBox.y - this.pathBoundingBox.height / 2,
    );

    ctx.transform(
      data.matrix[0][0],
      data.matrix[1][0],
      data.matrix[0][1],
      data.matrix[1][1],
      data.matrix[0][2],
      data.matrix[1][2],
    );
    ctx.translate(data.translate.x, data.translate.y);

    ctx.globalAlpha = Number(data.opacity);
    ctx.fillStyle = data.fill;
    ctx.strokeStyle = data.stroke;
    ctx.lineWidth = Number(data.strokeWidth);
    ctx.fill(data.coordinates);

    ctx.restore();
  }
}
