import { SupportedAssetsType, TileMapType } from "./types";

export const AssetHandler = (() => {
  const assets: { [key: string]: SupportedAssetsType } = {};

  function Instance() {

    function getAsset(name: string) {
      return assets[name];
    }

    const loadPng = async (name: string, path: string) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const png = new Image();
        png.src = path;
        png.onload = () => {
          assets[name] = png;
          resolve(png);
        }
        png.onerror = (err) => reject(err);
      });
    }

    const loadTileMap = async (name: string, path: string) => {
      try {
        const res = await fetch(path);
        const json = await res.json() as TileMapType;
        assets[name] = json;
        return json;
      } catch (err) {
        throw new Error(`Failed to load json: ${err}`);
      }
    }

    return {
      loadPng,
      loadTileMap,
      getAsset
    }
  }
  return Instance;
})();
