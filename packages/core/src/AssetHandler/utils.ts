import { SVGAsset, SVGCommand, SVGCommandKey, Vec2 } from "../../types";
import { identityMatrix, multiplyMatrices } from "../utils";

/**
 * The SVG coordinates  have  a specific number of values that should be passed with it, but svg commands can be written in a shorthand way,
 * using one single command character eg: L 100 100 200 200 300 300, or using multiple command characters eg: L 100 100 L 200 200 L 300 300.
 * We have this list to know where to split the values of the command to generate the right array of commands
 */
const SVGCommandValueLength: Record<SVGCommandKey, number> = {
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
        SVGCommandValueLength[characterCommand as SVGCommandKey];

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
 * Extracts the properties from the SVG element and returns them as
 * an object.
 */
const getPropertiesFromElement = (element: SVGElement) => {
  const style = element.getAttribute("style");
  const fill = element.getAttribute("fill");
  const opacity = element.getAttribute("opacity");
  const stroke = element.getAttribute("stroke");
  const strokeWidth = element.getAttribute("stroke-width");
  const strokeDasharray = element.getAttribute("stroke-dasharray");
  const strokeDashoffset = element.getAttribute("stroke-dashoffset");
  const strokeLinecap = element.getAttribute("stroke-linecap");
  const strokeLinejoin = element.getAttribute("stroke-linejoin");
  const strokeMiterlimit = element.getAttribute("stroke-miterlimit");
  const transform = element.getAttribute("transform");

  const styleProperties: Omit<SVGAsset, "coordinates"> = {
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
      const key = toCamelCase(match[1]) as keyof Omit<SVGAsset, "coordinates">;
      // @ts-expect-error - FixMe
      styleProperties[key] = match[2].trim();
      match = regex.exec(style);
    }
  }

  if (fill) {
    styleProperties.fill = fill;
  }

  if (opacity) {
    styleProperties.opacity = opacity;
  }

  if (stroke) {
    styleProperties.stroke = stroke;
  }

  if (strokeWidth) {
    styleProperties.strokeWidth = strokeWidth;
  }

  if (strokeDasharray) {
    styleProperties.strokeDasharray = strokeDasharray;
  }

  if (strokeDashoffset) {
    styleProperties.strokeDashoffset = strokeDashoffset;
  }

  if (strokeLinecap) {
    styleProperties.strokeLinecap = strokeLinecap;
  }

  if (strokeLinejoin) {
    styleProperties.strokeLinejoin = strokeLinejoin;
  }

  if (strokeMiterlimit) {
    styleProperties.strokeMiterlimit = strokeMiterlimit;
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

  return { ...styleProperties, translate, matrix };
};

/**
 * Creates a SVG string coordinates from an array of SVG commands.
 */
export const createCoordinatesFromSVGCommands = (commands: SVGCommand[]) => {
  return commands
    .map((command) => {
      const [key, ...values] = command;
      return `${key} ${values.join(" ")}`;
    })
    .join(" ");
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
  const elementProperties = getPropertiesFromElement(pathElement);

  const coordinates = pathElement.getAttribute("d");

  if (!coordinates) {
    throw new Error("Path element does not have coordinates");
  }

  const commands = createSVGCommandsFromSVGStringCoordinates(coordinates);

  return { coordinates, ...elementProperties, commands };
};

/**
 * Parses the polygon element and all it's properties into a SVGAsset, enabling easy access to the properties of the polygon element.
 * @param {SVGPolygonElement} polygonElement - The polygon element to parse.
 * @returns {CachedSVGAsset} The parsed polygon element.
 */
export const getSVGAssetsFromPolygonElement = (
  polygonElement: SVGPolygonElement,
): SVGAsset => {
  const elementProperties = getPropertiesFromElement(polygonElement);
  const pointsProperty = polygonElement.getAttribute("points");

  if (!pointsProperty) {
    throw new Error("Polygon element does not have points");
  }

  const points = pointsProperty.split(/\s|,/).map(Number);

  const commands: SVGCommand[] = [];

  for (let i = 0; i < points.length; i += 2) {
    if (i === 0) {
      commands.push(["M", points[i], points[i + 1]]);
    } else {
      const firstValue = points[i];
      const secondValue = points[i + 1];
      if (firstValue && secondValue) {
        commands.push(["L", points[i], points[i + 1]]);
      }
    }
  }
  commands.push(["Z"]);

  const coordinates = createCoordinatesFromSVGCommands(commands);

  return { coordinates, ...elementProperties, commands };
};

/**
 * Parses the circle element and all it's properties into a SVGAsset, enabling easy access to the properties of the circle element.
 * @param {SVGCircleElement} circleElement - The circle element to parse.
 */
export const getSVGAssetsFromCircleElement = (
  circleElement: SVGCircleElement,
): SVGAsset => {
  const elementProperties = getPropertiesFromElement(circleElement);
  const cx = circleElement.cx.baseVal.value;
  const cy = circleElement.cy.baseVal.value;
  const r = circleElement.r.baseVal.value;

  // convert circle to path
  const commands: SVGCommand[] = [
    ["M", cx - r, cy],
    ["a", r, r, 0, 1, 0, r * 2, 0],
    ["a", r, r, 0, 1, 0, -r * 2, 0],
    ["Z"],
  ];

  const coordinates = createCoordinatesFromSVGCommands(commands);

  return { coordinates, ...elementProperties, commands };
};

/**
 * Parses the rect element and all it's properties into a SVGAsset, enabling easy access to the properties of the rect element.
 * @param {SVGRectElement} rectElement - The rect element to parse.
 */
export const getSVGAssetsFromRectElement = (
  rectElement: SVGRectElement,
): SVGAsset => {
  const elementProperties = getPropertiesFromElement(rectElement);
  const x = rectElement.x.baseVal.value;
  const y = rectElement.y.baseVal.value;
  const width = rectElement.width.baseVal.value;
  const height = rectElement.height.baseVal.value;

  const commands: SVGCommand[] = [
    ["M", x, y],
    ["L", x + width, y],
    ["L", x + width, y + height],
    ["L", x, y + height],
    ["Z"],
  ];
  const coordinates = createCoordinatesFromSVGCommands(commands);

  return { coordinates, ...elementProperties, commands };
};

/**
 * Parses the ellipse element and all it's properties into a SVGAsset, enabling easy access to the properties of the ellipse element.
 * @param {SVGEllipseElement} ellipseElement - The ellipse element to parse.
 */
export const getSVGAssetsFromEllipseElement = (
  ellipseElement: SVGEllipseElement,
): SVGAsset => {
  const elementProperties = getPropertiesFromElement(ellipseElement);
  const cx = ellipseElement.cx.baseVal.value;
  const cy = ellipseElement.cy.baseVal.value;
  const rx = ellipseElement.rx.baseVal.value;
  const ry = ellipseElement.ry.baseVal.value;

  const commands: SVGCommand[] = [
    ["M", cx - rx, cy],
    ["a", rx, ry, 0, 1, 0, rx * 2, 0],
    ["a", rx, ry, 0, 1, 0, -rx * 2, 0],
    ["Z"],
  ];

  const coordinates = createCoordinatesFromSVGCommands(commands);

  return { coordinates, ...elementProperties, commands };
};

export const parentIsClipMask = (element: SVGElement) => {
  const parent = element.parentElement;
  if (!parent) return false;
  return parent.tagName === "clipPath";
};
