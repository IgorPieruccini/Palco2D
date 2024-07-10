import { AssetHandler } from "../core/AssetHandler";
import { RenderHandler } from "../core/RenderHandler";

export default (canvas: HTMLCanvasElement) => {

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context not found');
  }

  const init = async () => {
    const svg = await AssetHandler().loadSvg('svg', '/assets/image-svg.svg');
    console.log(svg);
    new RenderHandler(ctx, []);
  }

  init();
} 
