import { SupportedAssetsType, TileMapType } from "../types";

/**
 * AssetHandler is a singleton class that handles loading and storing assets.
 * That can be easily accessed by other classes to get the loaded asset.
 * @returns {Object} Instance of AssetHandler
 */
export const AssetHandler = (() => {
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
     * @param {string} name - Name of the font.
     * @param {string} path - Path to the font file.
     * @returns {Promise<FontFace>} - Promise that resolves to a FontFace object.
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
