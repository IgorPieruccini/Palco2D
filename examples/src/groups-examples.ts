import { Scene, SquareEntity } from "@palco-2d/core";
import {
  ActiveSelectionPlugin,
  AreaSelectionPlugin,
  InfinityCanvasPlugin,
  MoveEntityPlugin,
  RotateEntityPlugin,
} from "@palco-2d/plugins";

export class GroupExample extends Scene {
  public async start() {
    this.addPlugin(ActiveSelectionPlugin, "ActiveSelectionPlugin");
    this.addPlugin(MoveEntityPlugin, "MoveEntityPlugin");
    this.addPlugin(RotateEntityPlugin, "RotateEntityPlugin");
    this.addPlugin(InfinityCanvasPlugin, "InfinityCanvasPlugin");
    this.addPlugin(AreaSelectionPlugin, "AreaSelectionPlugin");

    const parentSquare = new SquareEntity({
      id: "parentSquare",
      position: {
        x: 100,
        y: 100,
      },
      size: {
        x: 100,
        y: 100,
      },
      rotation: 0,
      color: "#FF0000",
    });

    parentSquare.size = {
      x: 200,
      y: 200,
    };

    const childSquare = new SquareEntity({
      id: "childSquare",
      position: {
        x: 150,
        y: 150,
      },
      size: {
        x: 50,
        y: 50,
      },
      rotation: 0,
      color: "#00FF00",
    });

    parentSquare.addChild(childSquare);

    this.addEntity(parentSquare);

    this.render.startRender();
    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
