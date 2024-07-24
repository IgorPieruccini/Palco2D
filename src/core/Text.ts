import { BaseEntity, BaseEntityProps } from "./BaseEntity";

type TextProps = Omit<BaseEntityProps, 'size'>
  & {
    ctx: CanvasRenderingContext2D,
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

  constructor(props: TextProps) {
    const size = { x: 0, y: 0 };
    super({ ...props, size });

    this.text = props.text;

    this.color = props.color || this.color;
    this.font = props.font || this.font;
    this.fontSize = props.fontSize || this.fontSize;
    this.maxWidth = props.maxWidth || this.maxWidth;
  }

  private setTextBoundary(ctx: CanvasRenderingContext2D) {
    const metrics = ctx.measureText(this.text);
    this.size = { x: metrics.width, y: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent };
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.fillText(this.text, -this.size.x / 2, this.size.y / 2, this.maxWidth);

    this.setTextBoundary(ctx);
    ctx.restore();
  }

}
