import { BaseEntity, BaseEntityProps } from "../BaseEntity";

type SVGEntityProps = BaseEntityProps & { svg: SVGElement };

type DrawRectProps = { x: number, y: number, width: number, height: number, style: string, transform?: string };
type DrawCircleProps = { cx: number, cy: number, r: number, style: string, transform?: string };
type DrawPolygonProps = { points: string, style: string, transform?: string };
type DrawPathProps = { d: string, style: string, transform?: string, fill: string };

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

  private drawCircle(ctx: CanvasRenderingContext2D, attr: DrawCircleProps) {
    const color = attr.style.split(':')[1].replace(';', '');
    ctx.save();
    if (attr.transform) {
      const regex = /\(([^)]+)\)/g;
      const matches = attr.transform.match(regex);
      if (!matches || matches?.length === 0) return;

      const trim = matches[0]?.slice(1, - 1);
      const matrixValues = trim.split(" ").map((value) => parseFloat(value));
      ctx.transform(matrixValues[0], matrixValues[1], matrixValues[2], matrixValues[3], matrixValues[4], matrixValues[5]);
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(attr.cx, attr.cy, attr.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  private drawPolygon(ctx: CanvasRenderingContext2D, attr: DrawPolygonProps) {
    const color = attr.style.split(':')[1].replace(';', '');
    const coords = attr.points.split(' ').map((point) => {
      const [x, y] = point.split(',');
      return { x: parseFloat(x), y: parseFloat(y) };
    });
    ctx.save();
    if (attr.transform) {
      const regex = /\(([^)]+)\)/g;
      const matches = attr.transform.match(regex);
      if (!matches || matches?.length === 0) return;

      const trim = matches[0]?.slice(1, - 1);
      const matrixValues = trim.split(" ").map((value) => parseFloat(value));
      ctx.transform(matrixValues[0], matrixValues[1], matrixValues[2], matrixValues[3], matrixValues[4], matrixValues[5]);
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    coords.forEach((coord) => {
      ctx.lineTo(coord.x, coord.y);
    })
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  private createPathCoords = (d: string, ctx: CanvasRenderingContext2D) => {
    const coords = d.split(/(?=[MmHhVvLlCcSsQqTtAaZz])/);

    console.log(coords);
    let prevValues: number[] = [];
    for (let i = 0; i < coords.length; i++) {
      const command = coords[i][0];
      const values = coords[i].slice(1).split(/,|(?=-)| /).map((value) => parseFloat(value)).filter((value) => !isNaN(value));

      console.group('draw');
      console.log('command', command);
      console.log('values', values);
      console.log('prevValues', prevValues);
      console.groupEnd();

      switch (command) {
        case 'M':
          ctx.moveTo(values[0], values[1]);
          prevValues = values;
          break;
        case 'm':
          ctx.moveTo(prevValues[0] + values[0], prevValues[1] + values[1]);
          prevValues = values;
          break;
        case 'H':
          ctx.lineTo(values[0], prevValues[1]);
          prevValues = [values[0], prevValues[1]];
          break;
        case 'h':
          ctx.lineTo(prevValues[0] + values[0], prevValues[1]);
          prevValues = [prevValues[0] + values[0], prevValues[1]];
          break;
        case 'V':
          ctx.lineTo(prevValues[0], values[0]);
          prevValues = [prevValues[0], values[0]];
          break;
        case 'v':
          ctx.lineTo(prevValues[0], prevValues[1] + values[0]);
          prevValues = [prevValues[0], prevValues[1] + values[0]];
          break;
        case 'L':
          ctx.lineTo(values[0], values[1]);
          prevValues = values;
          break;
        case 'l':
          ctx.lineTo(prevValues[0] + values[0], prevValues[1] + values[1]);
          prevValues = [prevValues[0] + values[0], prevValues[1] + values[1]];
          break;
        case 'C': {
          const positionCoords = [values[4], values[5]];
          const bezierCoordsStart = [values[0], values[1]];
          const bezierCoordsEnd = [values[2], values[3]];
          ctx.bezierCurveTo(bezierCoordsStart[0], bezierCoordsStart[1], bezierCoordsEnd[0], bezierCoordsEnd[1], positionCoords[0], positionCoords[1]);
          prevValues = positionCoords;
          break;
        }
        case 'c': {
          const positionCoords = [prevValues[0] + values[4], prevValues[1] + values[5]];
          const bezierCoordsStart = [prevValues[0] + values[0], prevValues[1] + values[1]];
          const bezierCoordsEnd = [prevValues[0] + values[2], prevValues[1] + values[3]];
          ctx.bezierCurveTo(bezierCoordsStart[0], bezierCoordsStart[1], bezierCoordsEnd[0], bezierCoordsEnd[1], positionCoords[0], positionCoords[1]);
          prevValues = positionCoords;
          break;
        }
        default:
          break;
      }

    }

  }

  private drawPath(ctx: CanvasRenderingContext2D, attr: DrawPathProps) {
    const styleAttribute = attr.style;
    const fill = attr.fill;
    ctx.save();
    if (attr.transform) {
      const regex = /\(([^)]+)\)/g;
      const matches = attr.transform.match(regex);
      if (!matches || matches?.length === 0) return;

      const trim = matches[0]?.slice(1, - 1);
      const matrixValues = trim.split(" ").map((value) => parseFloat(value));
      ctx.transform(matrixValues[0], matrixValues[1], matrixValues[2], matrixValues[3], matrixValues[4], matrixValues[5]);
    }

    if (styleAttribute) {
      const color = styleAttribute.split(':')[1].replace(';', '');
      ctx.fillStyle = color;
    };

    if (fill) {
      ctx.fillStyle = fill.split(' ')[0];
    }

    ctx.beginPath();
    this.createPathCoords(attr.d, ctx);
    ctx.fill();
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

        case 'circle':
          const circleAttributes = this.getAttributes(child);
          this.drawCircle(ctx, circleAttributes as unknown as DrawCircleProps);
          break;

        case 'polygon':
          const poligonAttributes = this.getAttributes(child);
          this.drawPolygon(ctx, poligonAttributes as unknown as DrawPolygonProps);
          break;

        case 'path':
          console.log('path');
          const pathAttributes = this.getAttributes(child);
          this.drawPath(ctx, pathAttributes as unknown as DrawPathProps);
          break;

        default:
          break;
      }
    });
  }

  render(ctx: CanvasRenderingContext2D) {
  }

}
