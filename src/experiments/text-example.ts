import { AssetHandler } from "../core/AssetHandler";
import { Scene } from "../core/SceneHandler/Scene";
import { Text } from "../core/Text";

export class TextExample extends Scene {

  public async start() {

    await AssetHandler().loadFont('PixelifySans', 'assets/PixelifySans-Regular.ttf');

    const text = new Text({
      ctx: this.ctx,
      text: 'Click me!',
      color: 'white',
      font: 'PixelifySans',
      fontSize: 50,
      position: { x: 400, y: 100 },
      rotation: 0,
    });

    text.on('mouseenter', () => {
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


    this.render.addEntity(text);
    this.render.startRender();

    this.mouseHandler.addEntity(text);
    this.mouseHandler.start();
  }

}
