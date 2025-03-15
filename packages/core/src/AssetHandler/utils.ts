import { CachedSVGAsset, Vec2 } from "../../types";
import { identityMatrix, multiplyMatrices } from "../utils";

function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

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

  return { coordinates, ...styleProperties, translate, matrix };
};
