import { BaseEntity, BaseEntityProps } from "./BaseEntity";

type TextProps = BaseEntityProps & {
  text: string,
  color?: string,
  font?: string,
  fontSize?: number,
};

export class Text extends BaseEntity {
  text: string = '';
  color: string = 'black';
  font: string = 'Arial';
  fontSize: number = 20;

  constructor(props: TextProps) {
    super(props);

    this.text = props.text;

    this.color = props.color || this.color;
    this.font = props.font || this.font;
    this.fontSize = props.fontSize || this.fontSize;
  }


  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }

}
