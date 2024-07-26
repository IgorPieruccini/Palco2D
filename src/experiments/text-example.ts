import { AssetHandler } from "../core/AssetHandler";
import { Scene } from "../core/SceneHandler/Scene";
import { SquareEntity } from "../core/SquareEntity";
import { Text } from "../core/Text";

export class TextExample extends Scene {

  public async start() {

    await AssetHandler().loadFont('PixelifySans', 'assets/PixelifySans-Regular.ttf');


    const addEventsToText = (text: Text) => {

      text.on('mouseenter', () => {
        console.log(text.id);
        text.color = 'red';
      });

      text.on('mouseleave', () => {
        text.color = 'white';
      });

      text.on('mousedown', () => {
        if (text.text === 'Clicked!') {
          text.text = 'Click me!'
          return;
        }
        text.text = 'Clicked!';
      });

    }

    const parentText = new Text({
      id: 'text-parent',
      text: 'Click me!',
      color: 'white',
      font: 'PixelifySans',
      fontSize: 50,
      position: { x: 200, y: 100 },
      rotation: 45,
    });
    addEventsToText(parentText);


    const childText = new Text({
      id: 'text-child',
      text: 'Click me!',
      color: 'white',
      font: 'PixelifySans',
      fontSize: 30,
      position: { x: 0, y: 100 },
      rotation: 0,
    });
    addEventsToText(childText);

    parentText.addChild(childText);


    const graph1 = new SquareEntity({
      position: { x: 300, y: 400 },
      size: { x: 100, y: 100 },
      rotation: 90,
    });

    const graph2 = new SquareEntity({
      position: { x: 120, y: 0 },
      size: { x: 100, y: 100 },
      rotation: 0,
    });


    graph1.addChild(graph2);

    this.render.addEntities([parentText, graph1]);
    this.render.startRender();

    this.mouseHandler.addEntities([parentText, childText]);
    this.mouseHandler.start();
  }

}
