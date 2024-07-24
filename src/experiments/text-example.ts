import { Scene } from "../core/SceneHandler/Scene";
import { Text } from "../core/Text";

export class TextExample extends Scene {

  public async start() {

    const text = new Text({
      text: 'Hello World',
      color: 'white',
      font: 'Arial',
      fontSize: 50,
      position: { x: 100, y: 100 },
      size: { x: 100, y: 100 },
      rotation: 0,
    });


    this.render.addEntity(text);
    this.render.startRender();
  }

}
