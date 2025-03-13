import { CachedSVGAsset } from "../../types";

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

  return { coordinates, ...styleProperties };
};
