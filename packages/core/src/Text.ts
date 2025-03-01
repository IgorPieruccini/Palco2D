import { BaseEntity } from "./BaseEntity";
import { BaseEntityProps, Vec2 } from "../types";
import {
  getPositionFromMatrix,
  getRotationAngleFromMatrix,
  multiplyMatrices,
} from "./utils";

type Shadow = {
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
};

type Stroke = {
  strokeColor: string;
  lineWidth: number;
};

type TextProps = Omit<BaseEntityProps, "size"> & {
  text: string;
  color?: string;
  stroke?: Stroke;
  font?: string;
  fontSize?: number;
  maxWidth?: number;
  shadow?: Shadow;
};

export class Text extends BaseEntity {
  text: string = "";
  color: string = "black";
  stroke: Stroke | undefined = undefined;
  font: string = "Arial";
  fontSize: number = 20;
  maxWidth: number | undefined = undefined;
  dimations: Vec2 = { x: 0, y: 0 };
  shadow: Shadow | undefined = undefined;

  constructor(props: TextProps) {
    const size = { x: 1, y: 1 };
    super({ ...props, size });

    this.text = props.text;

    this.color = props.color || this.color;
    this.font = props.font || this.font;
    this.fontSize = props.fontSize || this.fontSize;
    this.maxWidth = props.maxWidth || this.maxWidth;
    this.stroke = props.stroke;
    this.shadow = props.shadow;
  }

  private setTextBoundary(ctx: CanvasRenderingContext2D) {
    const metrics = ctx.measureText(this.text);
    const fontHeight =
      metrics.fontBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    this.dimations = { x: metrics.width, y: fontHeight };
  }

  isPointOverEntity(point: Vec2) {
    const relativePosition = this.getRelativePostion(point);

    const mousePos = {
      x: relativePosition.x,
      y: relativePosition.y,
    };

    return (
      this.dimations.x >= mousePos.x &&
      0 <= mousePos.x &&
      this.dimations.y >= mousePos.y &&
      0 <= mousePos.y
    );
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.textBaseline = "top";

    if (this.shadow) {
      ctx.shadowColor = this.shadow.shadowColor;
      ctx.shadowBlur = this.shadow.shadowBlur;
      ctx.shadowOffsetX = this.shadow.shadowOffsetX;
      ctx.shadowOffsetY = this.shadow.shadowOffsetY;
    }

    if (this.stroke) {
      ctx.strokeStyle = this.stroke.strokeColor;
      ctx.lineWidth = this.stroke.lineWidth;
      ctx.strokeText(this.text, 0, 0, this.maxWidth);
    }

    ctx.fillStyle = this.color;
    ctx.fillText(this.text, 0, 0, this.maxWidth);

    this.setTextBoundary(ctx);
  }

  public getCoords() {
    const parentMatrix = this.getWorldMatrix();
    const parentRotation = getRotationAngleFromMatrix(parentMatrix);
    const matrix = this.getMatrix();

    const finalMatrix = multiplyMatrices(parentMatrix, matrix);
    const position = getPositionFromMatrix(finalMatrix);

    const corners = [
      { x: -this.dimations.x / 2, y: -this.dimations.y / 2 },
      { x: this.dimations.x / 2, y: -this.dimations.y / 2 },
      { x: -this.dimations.x / 2, y: this.dimations.y / 2 },
      { x: this.dimations.x / 2, y: this.dimations.y / 2 },
    ];

    const angle = parentRotation * (180 / Math.PI);
    const finalAngle = this.rotation + angle;
    const rad = finalAngle * (Math.PI / 180);

    const scale = this.getScale();
    const cos = Math.cos(rad) * scale.x;
    const sin = Math.sin(rad) * scale.y;

    return corners.map((corner) => {
      const x = corner.x * cos - corner.y * sin;
      const y = corner.x * sin + corner.y * cos;

      return {
        x: x + position.x,
        y: y + position.y,
      };
    });
  }

  serialize() {
    const data = super.serialize();
    return {
      ...data,
      type: "text",
      text: this.text,
      color: this.color,
      font: this.font,
      fontSize: this.fontSize,
      maxWidth: this.maxWidth,
      shadow: this.shadow,
      stroke: this.stroke,
    };
  }
}
