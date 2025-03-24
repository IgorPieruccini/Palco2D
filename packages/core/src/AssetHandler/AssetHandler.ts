import { SVGAsset, SupportedAssetsType, TileMapType } from "../../types";
import {
  getSVGAssetsFromCircleElement,
  getSVGAssetsFromPathElement,
  getSVGAssetsFromPolygonElement,
} from "./utils";

/**
 * AssetHandler is a singleton class that handles loading and storing assets.
 * That can be easily accessed by other classes to get the loaded asset.
 * @returns {Object} Instance of AssetHandler
 */
export class AssetHandler {
  public static assets: { [key: string]: SupportedAssetsType } = {};

  public static getAsset<T extends SupportedAssetsType>(key: string): T {
    return this.assets[key] as T;
  }

  /**
   * Load a png image from the given path.
   * @param {string} path - Path to the png image.
   */
  public static loadPng = async (path: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const png = new Image();
      png.src = path;
      png.onload = () => {
        this.assets[path] = png;
        resolve(png);
      };
      png.onerror = (err) => reject(err);
    });
  };

  /**
   * Load a svg image from the given path.
   * it scans the svg for path elements then store the stringfied coordinates in an array,
   * to be accessed later by the SVGImage  entity.
   * @param {string} path - Path to the svg image.
   */
  public static loadSVG = async (path: string) => {
    return new Promise<SVGAsset[]>((resolve, reject) => {
      fetch(path)
        .then((res) => res.text())
        .then((data) => {
          const parser = new DOMParser();
          const svg = parser.parseFromString(data, "image/svg+xml");

          const svgAssets: SVGAsset[] = [];

          // Load path
          const paths = svg.getElementsByTagName("path");
          for (let i = 0; i < paths.length; i++) {
            const pathProperties = getSVGAssetsFromPathElement(paths[i]);
            svgAssets.push(pathProperties);
          }

          // load polygon
          const polygons = svg.getElementsByTagName("polygon");
          for (let i = 0; i < polygons.length; i++) {
            const pathProperties = getSVGAssetsFromPolygonElement(polygons[i]);
            svgAssets.push(pathProperties);
          }

          // load circle
          const circles = svg.getElementsByTagName("circle");
          for (let i = 0; i < circles.length; i++) {
            const pathProperties = getSVGAssetsFromCircleElement(circles[i]);
            svgAssets.push(pathProperties);
          }

          this.assets[path] = svgAssets;
          resolve(svgAssets);
        })
        .catch((err) => reject(err));
    });
  };

  /**
   * Load a tilemap from the given path.
   * @param {string} path - Path to the tilemap json file.
   */
  public static loadTileMap = async (path: string) => {
    try {
      const res = await fetch(path);
      const json = (await res.json()) as TileMapType;
      this.assets[path] = json;
      return json;
    } catch (err) {
      throw new Error(`Failed to load json: ${err}`);
    }
  };

  /**
   * Load a font from the given path and add to document.fonts.
   */
  public static loadFont = async (name: string, path: string) => {
    return new Promise<FontFace>((resolve, reject) => {
      const font = new FontFace(name, `url(${path})`);
      font
        .load()
        .then((loadedFont) => {
          //@ts-ignore FontFaceSet does have a add method: https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/add
          document.fonts.add(loadedFont);
          resolve(loadedFont);
        })
        .catch((err) => reject(err));
    });
  };
}
