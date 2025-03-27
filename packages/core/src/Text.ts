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
    this.initialSize = { x: metrics.width, y: fontHeight };
    this.size = { x: metrics.width, y: fontHeight };
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

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
