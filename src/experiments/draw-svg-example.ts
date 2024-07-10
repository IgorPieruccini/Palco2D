import { AssetHandler } from "../core/AssetHandler";
import { SVGEntity } from "../core/SVGEntity/SVGEntity";

export default (canvas: HTMLCanvasElement) => {

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context not found');
  }

  const init = async () => {
    const svgElement = await AssetHandler().loadSvg('svg', '/assets/image-svg.svg');
    console.log(svgElement);

    const svgEntity = new SVGEntity({
      svg: svgElement,
      position: { x: 100, y: 100 },
      size: { x: 100, y: 100 },
      rotation: 0,
    });


    ctx.scale(20, 20);
    svgEntity.drawSVG(ctx, svgElement);


  }

  init();
} 
