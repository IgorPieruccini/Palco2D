import { BaseEntity } from "./BaseEntity";
import { BaseEntityProps, Vec2 } from "./types";

type TextProps = Omit<BaseEntityProps, 'size'>
  & {
    text: string,
    color?: string,
    font?: string,
    fontSize?: number,
    maxWidth?: number
  };

export class Text extends BaseEntity {
  text: string = '';
  color: string = 'black';
  font: string = 'Arial';
  fontSize: number = 20;
  maxWidth: number | undefined = undefined;
  dimations: Vec2 = { x: 0, y: 0 };

  constructor(props: TextProps) {
    const size = { x: 1, y: 1 };
    super({ ...props, size });

    this.text = props.text;

    this.color = props.color || this.color;
    this.font = props.font || this.font;
    this.fontSize = props.fontSize || this.fontSize;
    this.maxWidth = props.maxWidth || this.maxWidth;
  }

  private setTextBoundary(ctx: CanvasRenderingContext2D) {
    const metrics = ctx.measureText(this.text);
    const fontHeight = metrics.fontBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    this.dimations = { x: metrics.width, y: fontHeight };
  }

  isPointOverEntity(point: Vec2) {
    const relativePosition = this.getRelativePostion(point);

    const mousePos = {
      x: relativePosition.x,
      y: relativePosition.y,
    }

    return (
      this.dimations.x >= mousePos.x &&
      0 <= mousePos.x &&
      this.dimations.y >= mousePos.y &&
      0 <= mousePos.y
    );
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.textBaseline = 'top';
    ctx.fillText(this.text, 0, 0, this.maxWidth);
    this.setTextBoundary(ctx);
  }

}
