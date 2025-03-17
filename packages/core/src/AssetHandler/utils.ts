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
