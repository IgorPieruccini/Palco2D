
import { AssetHandler } from "../core/AssetHandler";
import { BaseEntity } from "../core/BaseEntity";
import { BatchGraphicHandler } from "../core/BatchGrahicHandler";
import { MouseHandler } from "../core/MouseHandler";
import { RenderHandler } from "../core/RenderHandler";
import { Sprite } from "../core/Sprite";

export default (canvas: HTMLCanvasElement) => {

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context not found');
  }


  const bacthHandler = new BatchGraphicHandler();

  const init = async () => {
    const texture = await AssetHandler().loadPng('frog', 'assets/ninja-frog-jump.png');

    const mainFrog = new Sprite({
      texture,
      position: { x: 100, y: 100 },
      rotation: 0,
      layer: 0,
    });

    mainFrog.size = { x: 54, y: 54 };
    mainFrog.on('mousehover', () => {
      mainFrog.rotation += 2;
    });

    const createFrogs = () => {
      const entities: BaseEntity[] = [];
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {

          const frog = new Sprite({
            texture,
            position: { x: 50 * x, y: 50 * y },
            rotation: 0,
            layer: x % 2,
            static: true
          });

          entities.push(frog);
        }
      }
      return entities
    };

    const entities = createFrogs();
    bacthHandler.batchStaticObjects(entities);
    const statics = bacthHandler.getAllStaticBatches();

    const staticEntities = statics.map((drawMethod) => {
      const entitiy = new BaseEntity({
        position: { x: 0, y: 0 },
        rotation: 0,
        size: { x: 1, y: 1 },
        layer: 0
      });
      entitiy.render = drawMethod;
      return entitiy;
    });


    new RenderHandler(ctx, [...staticEntities, mainFrog]);
    new MouseHandler(canvas, [mainFrog]);
  };

  init();





} 
