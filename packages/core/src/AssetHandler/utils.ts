import { SVGAsset, SVGCommand, SVGCommandKey, Vec2 } from "../../types";
import { identityMatrix, multiplyMatrices } from "../utils";

/**
 * The SVG coordinates  have  a specific number of values that should be passed with it, but svg commands can be written in a shorthand way,
 * using one single command character eg: L 100 100 200 200 300 300, or using multiple command characters eg: L 100 100 L 200 200 L 300 300.
 * We have this list to know where to split the values of the command to generate the right array of commands
 */
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

/**
 * Parses the SVG string coordinates into an array of SVG commands.
 * @param {string} d - The SVG string coordinates.
 * @returns {SVGCommand[]} - The parsed SVG commands.
 * ```ts
 * Example:
 * const d = "M 100 100 L 200 200 L 300 300";
 * [ [ 'M', 100, 100 ], [ 'L', 200, 200 ], [ 'L', 300, 300 ] ]
 * ```
 */
export const createSVGCommandsFromSVGStringCoordinates = (d: string) => {
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
        throw new Error("Commands must have values");
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

/**
 * Parses the path element and all it's properties into a SVGAsset, enabling easy access to the properties of the path element.
 * @param {SVGPathElement} pathElement - The path element to parse.
 * @returns {CachedSVGAsset} The parsed path element.
 *
 * @example
 * takes a path element:
 * ```ts
 *  <path d="M 100 100 L 200 200 L 300 300" fill="none" stroke="black" stroke-width="2" />
 * ```
 * and returns:
 * ```ts
 * {
 *  coordinates: "M 100 100 L 200 200 L 300 300",
 *  fill: "none",
 *  stroke: "black",
 *  strokeWidth: "2",
 *  opacity: "1",
 *  matrix: [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ],
 *  translate: { x: 0, y: 0 },
 *  commands: [ [ 'M', 100, 100 ], [ 'L', 200, 200 ], [ 'L', 300, 300 ] ]
 *  ...restOfProperties
 *  }
 * ```
 */
export const getSVGAssetsFromPathElement = (
  pathElement: SVGPathElement,
): SVGAsset => {
  const coordinates = pathElement.getAttribute("d");

  if (!coordinates) {
    throw new Error("Path element does not have coordinates");
  }

  const style = pathElement.getAttribute("style");
  const fill = pathElement.getAttribute("fill");
  const transform = pathElement.getAttribute("transform");

  let styleProperties: Omit<SVGAsset, "coordinates"> = {
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

  if (fill) {
    styleProperties.fill = fill;
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
