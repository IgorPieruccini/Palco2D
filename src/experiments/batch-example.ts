
import { AssetHandler } from "../core/AssetHandler";
import { BaseEntity } from "../core/BaseEntity";
import { BatchGraphicHandler } from "../core/BatchGrahicHandler";
import { Sprite } from "../core/Sprite";

export default (canvas: HTMLCanvasElement) => {

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context not found');
  }


  const bacthHandler = new BatchGraphicHandler();

  const init = async () => {
    const texture = await AssetHandler().loadPng('frog', 'assets/ninja-frog-jump.png');

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
    const drawStatic0 = bacthHandler.getBatch('STATIC0');
    const drawStatic1 = bacthHandler.getBatch('STATIC1');

    drawStatic0(ctx);
    drawStatic1(ctx);
  };

  init();





} 
