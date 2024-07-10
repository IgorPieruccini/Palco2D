import { BaseEntity, BaseEntityProps } from "../BaseEntity";

type SVGEntityProps = BaseEntityProps & { svg: SVGElement };

type DrawRectProps = { x: number, y: number, width: number, height: number, style: string, transform?: string };

export class SVGEntity extends BaseEntity {
  svgElement: SVGElement;

  constructor(props: SVGEntityProps) {
    super(props);
    this.svgElement = props.svg;
  }

  private getAttributes(element: Element) {
    const attributes = element.attributes;
    const attributesObject: Record<string, string> = {};

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const name = attr.name;
      const value = attr.value;
      attributesObject[name] = value;
    }

    return attributesObject;
  }

  private drawRect(ctx: CanvasRenderingContext2D, attr: DrawRectProps) {
    const color = attr.style.split(':')[1].replace(';', '');
    ctx.save();
    ctx.beginPath();
    if (attr.transform) {
      const regex = /\(([^)]+)\)/g;
      const matches = attr.transform.match(regex);
      if (!matches || matches?.length === 0) return;

      const trim = matches[0]?.slice(1, - 1);
      const matrixValues = trim.split(" ").map((value) => parseFloat(value));
      ctx.transform(matrixValues[0], matrixValues[1], matrixValues[2], matrixValues[3], matrixValues[4], matrixValues[5]);
    }

    ctx.fillStyle = color;
    ctx.fillRect(attr.x, attr.y, attr.width, attr.height);
    ctx.closePath();
    ctx.restore();
  }

  drawSVG(ctx: CanvasRenderingContext2D, element: Element) {
    const children = Array.from(element.children);

    children.forEach((child) => {
      const hasChildren = child.children.length > 0;

      if (hasChildren) {
        this.drawSVG(ctx, child);
      }

      const elementTag = child.tagName;

      switch (elementTag) {
        case 'rect':
          const elementAttributes = this.getAttributes(child);
          this.drawRect(ctx, elementAttributes as unknown as DrawRectProps);
          break;

        default:
          break;
      }


    });
  }

  render(ctx: CanvasRenderingContext2D) {
  }

}
