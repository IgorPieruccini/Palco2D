import { AssetHandler } from "../core/AssetHandler";
import { MouseHandler } from "../core/MouseHandler";
import { RenderHandler } from "../core/RenderHandler";
import { Sprite } from "../core/Sprite";

export default (canvas: HTMLCanvasElement) => {

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context not found');
  }

  const init = async () => {
    const ninjaTexture = await AssetHandler().loadPng('frog', 'assets/ninja-frog-run.png');
    const ninjaTileMap = await AssetHandler().loadTileMap('frog-tilemap', 'assets/ninja-frog-run.tilemap.json');

    const entities: Sprite[] = [];


    const createFrogs = () => {
      for (let x = 0; x < 1000; x++) {
        const frog = new Sprite({
          texture: ninjaTexture,
          position: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
          rotation: 0,
          tileMap: ninjaTileMap,
        });

        const speed = 2 + (Math.random()) * 2;
        frog.animation?.setSpeed(speed);
        frog.animation?.start();


        frog.on('mouseenter', () => {
          frog.animation?.stop();
        });


        entities.push(frog);
      }
    }

    createFrogs();

    new MouseHandler(canvas, entities);
    new RenderHandler(canvas, entities);
  }

  init();

} 
