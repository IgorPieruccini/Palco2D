import { AssetHandler } from "../core/AssetHandler";
import { BaseEntity } from "../core/BaseEntity";
import { MouseHandler } from "../core/MouseHandler";
import { RenderHandler } from "../core/RenderHandler";
import { Sprite } from "../core/Sprite";

export default (canvas: HTMLCanvasElement) => {

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context not found');
  }

  const init = async () => {
    const texture = await AssetHandler().loadPng('frog', 'assets/ninja-frog-jump.png');

    const entities: BaseEntity[] = [];

    const createFrogs = () => {
      for (let x = 0; x < 1000; x++) {
        const frog = new Sprite({
          texture,
          position: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
          rotation: 0
        });

        frog.size = { x: 64, y: 54 };

        frog.on('mouseenter', () => {
          frog.size = { x: frog.size.x + 10, y: frog.size.y + 10 };
        });

        frog.on('mouseleave', () => {
          frog.size = { x: frog.size.x - 10, y: frog.size.y - 10 };
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
