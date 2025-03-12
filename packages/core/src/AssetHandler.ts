import {
  CachedSVGCoordinates,
  SupportedAssetsType,
  TileMapType,
} from "../types";

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
    return new Promise<CachedSVGCoordinates>((resolve, reject) => {
      fetch(path)
        .then((res) => res.text())
        .then((data) => {
          const parser = new DOMParser();
          const svg = parser.parseFromString(data, "image/svg+xml");
          const paths = svg.getElementsByTagName("path");
          const coordinates: string[] = [];
          for (let i = 0; i < paths.length; i++) {
            coordinates.push(paths[i].getAttribute("d") as string);
          }
          this.assets[path] = coordinates;
          resolve(coordinates);
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

/**
 * AssetHandler is a singleton class that handles loading and storing assets.
 * That can be easily accessed by other classes to get the loaded asset.
 * @returns {Object} Instance of AssetHandler
 */
export const _AssetHandler = (() => {
  const assets: { [key: string]: SupportedAssetsType } = {};

  function Instance() {
    function getAsset<T extends SupportedAssetsType>(key: string): T {
      return assets[key] as T;
    }

    /**
     * Load a png image from the given path.
     * @param {string} path - Path to the png image.
     */
    const loadPng = async (path: string) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const png = new Image();
        png.src = path;
        png.onload = () => {
          assets[path] = png;
          resolve(png);
        };
        png.onerror = (err) => reject(err);
      });
    };

    /**
     * Load a tilemap from the given path.
     * @param {string} path - Path to the tilemap json file.
     */
    const loadTileMap = async (path: string) => {
      try {
        const res = await fetch(path);
        const json = (await res.json()) as TileMapType;
        assets[path] = json;
        return json;
      } catch (err) {
        throw new Error(`Failed to load json: ${err}`);
      }
    };

    /**
     * Load a font from the given path and add to document.fonts.
     */
    const loadFont = async (name: string, path: string) => {
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

    return {
      loadPng,
      loadTileMap,
      loadFont,
      getAsset,
    };
  }
  return Instance;
})();
