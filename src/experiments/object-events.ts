import { BaseEntity } from "../core/BaseEntity";
import { Scene } from "../core/SceneHandler/Scene";
import { SquareEntity } from "../core/SquareEntity";

export class ObjectEventsExample extends Scene {

  public async start() {
    const entities: BaseEntity[] = [];
    let dragEntitiy: BaseEntity | null = null;

    const createInteractiveSquare = () => {
      const index = entities.length;
      const square = new SquareEntity({
        position: { x: 100 * index, y: 100 * index },
        size: { x: 100, y: 100 },
        rotation: Math.random() * 360,
      });

      square.on('mousehover', () => {
        square.rotation += 1;
        if (dragEntitiy) {
          square.position = dragEntitiy.position;
        }
      });

      square.on('mouseenter', () => {
        dragEntitiy = square;
        square.size = { x: 120, y: 120 };
      });

      square.on('mouseleave', () => {
        dragEntitiy = null;
        square.size = { x: 100, y: 100 };
      });

      square.on('mousedown', () => {
        square.size = { x: 20, y: 20 };
      });

      entities.push(square);
    }

    for (let i = 0; i < 10; i++) {
      createInteractiveSquare();
    }

    this.mouseHandler.addEntities(entities);
    this.render.addEntities(entities);
    this.render.startRender();
    this.mouseHandler.start();
  }

}

