import { CachedSVGAsset, SVGCommand, SVGCommandKey, Vec2 } from "../../types";
import { identityMatrix, multiplyMatrices } from "../utils";

const SVGCommandValueLenght: Record<SVGCommandKey, number> = {
  M: 2,
  m: 2,
  L: 2,
  l: 2,
  H: 1,
  h: 1,
  V: 1,
  v: 1,
  C: 6,
  c: 6,
  S: 4,
  s: 4,
  A: 7,
  a: 7,
  Q: 4,
  q: 4,
  T: 2,
  t: 2,
  Z: 0,
  z: 0,
};

function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

const createSVGCommandsFromSVGStringCoordinates = (d: string) => {
  const regex = /([MmLlHhVvCcSsQqTtAaZz])\s*([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  const commands: SVGCommand[] = [];
  let match: RegExpExecArray | null = regex.exec(d);

  while (match !== null) {
    const characterCommand = match[1] as SVGCommand[0];

    const values = match[2].match(/-?\d+(\.\d+)?/g);

    if (characterCommand === "Z" || characterCommand === "z") {
      commands.push([characterCommand]);
    } else {
      if (!values) {
        throw new Error("Values are not defined");
      }
      const numberValues = values.map(Number);
      const expectedLength =
        SVGCommandValueLenght[characterCommand as SVGCommandKey];

      if (numberValues.length > expectedLength) {
        const splitValues: number[][] = [];
        for (let i = 0; i < numberValues.length; i += expectedLength) {
          splitValues.push(numberValues.slice(i, i + expectedLength));
        }

        splitValues.forEach((value) => {
          //@ts-expect-error - FixMe
          commands.push([characterCommand, ...value]);
        });
      } else {
        //@ts-expect-error - FixMe
        commands.push([characterCommand, ...numberValues]);
      }
    }
    match = regex.exec(d);
  }

  return commands;
};

export const getSVGAssetsFromPathElement = (
  pathElement: SVGPathElement,
): CachedSVGAsset => {
  const coordinates = pathElement.getAttribute("d");

  if (!coordinates) {
    throw new Error("Path element does not have coordinates");
  }

  const style = pathElement.getAttribute("style");
  const transform = pathElement.getAttribute("transform");

  let styleProperties: Omit<CachedSVGAsset, "coordinates"> = {
    fill: "none",
    stroke: "none",
    strokeWidth: "0",
    strokeDasharray: "none",
    strokeDashoffset: "none",
    strokeLinecap: "butt",
    strokeLinejoin: "miter",
    strokeMiterlimit: "4",
    fillRule: "nonzero",
    opacity: "1",
    matrix: identityMatrix,
    translate: { x: 0, y: 0 },
    commands: [],
  };

  if (style) {
    const regex = /([\w-]+):\s*([^;]+)/g;
    let match: RegExpExecArray | null = regex.exec(style);

    while (match !== null) {
      //@ts-expect-error - FixMe
      styleProperties[toCamelCase(match[1])] = match[2].trim();
      match = regex.exec(style);
    }
  }

  const matrices: Array<number[][]> = [];
  let matrix: number[][] = identityMatrix;
  let translate: Vec2 = { x: 0, y: 0 };

  if (transform) {
    const transformRegex = /(\w+)\(([^)]+)\)/g;
    let match: RegExpExecArray | null = transformRegex.exec(transform);

    while (match !== null) {
      const method = match[1];

      if (method === "matrix") {
        const values = match[2].split(/\s|,/).map(Number);
        const [a, b, c, d, e, f] = values;
        const convertedMatrix = [
          [a, c, e],
          [b, d, f],
          [0, 0, 1],
        ];
        matrices.push(convertedMatrix);
      } else if (method === "translate") {
        const values = match[2].split(/,/).map(Number);
        translate = { x: values[0], y: values[1] };
      }

      match = transformRegex.exec(transform);
    }
  }

  if (matrices.length > 0) {
    for (let i = 0; i < matrices.length; i++) {
      matrix = multiplyMatrices(matrix, matrices[i]);
    }
  }

  const commands = createSVGCommandsFromSVGStringCoordinates(coordinates);

  return { coordinates, ...styleProperties, translate, matrix, commands };
};

type BezierCurve = [number, number, number, number, number, number];

export function arcToCubicBezier(
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  phi: number,
  largeArcFlag: number,
  sweepFlag: number,
  x2: number,
  y2: number,
): BezierCurve[] {
  const curves: BezierCurve[] = [];
  const sinPhi = Math.sin((phi * Math.PI) / 180);
  const cosPhi = Math.cos((phi * Math.PI) / 180);

  let dx = (x1 - x2) / 2;
  let dy = (y1 - y2) / 2;
  let x1p = cosPhi * dx + sinPhi * dy;
  let y1p = -sinPhi * dx + cosPhi * dy;

  let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const sqrtLambda = Math.sqrt(lambda);
    rx *= sqrtLambda;
    ry *= sqrtLambda;
  }

  const rxSq = rx * rx;
  const rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;

  let factor = Math.sqrt(
    Math.max(
      0,
      (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) /
      (rxSq * y1pSq + rySq * x1pSq),
    ),
  );
  if (largeArcFlag === sweepFlag) factor = -factor;

  const cxp = (factor * (rx * y1p)) / ry;
  const cyp = (factor * (-ry * x1p)) / rx;

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  let theta1 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
  let deltaTheta = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx) - theta1;

  if (sweepFlag === 0 && deltaTheta > 0) {
    deltaTheta -= 2 * Math.PI;
  } else if (sweepFlag === 1 && deltaTheta < 0) {
    deltaTheta += 2 * Math.PI;
  }

  const numSegments = Math.ceil(Math.abs(deltaTheta) / (Math.PI / 2));
  const delta = deltaTheta / numSegments;
  const t = ((8 / 3) * Math.pow(Math.sin(delta / 4), 2)) / Math.sin(delta / 2);

  for (let i = 0; i < numSegments; i++) {
    const angle1 = theta1 + i * delta;
    const angle2 = theta1 + (i + 1) * delta;

    const x1 = cx + rx * Math.cos(angle1);
    const y1 = cy + ry * Math.sin(angle1);
    const x2 = cx + rx * Math.cos(angle2);
    const y2 = cy + ry * Math.sin(angle2);

    const dx1 = -rx * Math.sin(angle1) * t;
    const dy1 = ry * Math.cos(angle1) * t;
    const dx2 = rx * Math.sin(angle2) * t;
    const dy2 = -ry * Math.cos(angle2) * t;

    curves.push([x1 + dx1, y1 + dy1, x2 + dx2, y2 + dy2, x2, y2]);
  }

  return curves;
}
