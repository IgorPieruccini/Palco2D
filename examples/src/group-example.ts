import { GroupEntity, Scene, SquareEntity } from "@palco-2d/core";
import {
  ActiveSelectionPlugin,
  AreaSelectionPlugin,
  InfinityCanvasPlugin,
  MoveEntityPlugin,
} from "@palco-2d/plugins";

export class GroupExample extends Scene {
  public async start() {
    this.addPlugin(InfinityCanvasPlugin, "infinityCanvas");
    this.addPlugin(ActiveSelectionPlugin, "ActiveSelection");
    this.addPlugin(AreaSelectionPlugin, "AreaSelectionPlugin");
    this.addPlugin(MoveEntityPlugin, "MoveEntityPlugin");
    // this.addPlugin(RotateEntityPlugin, "RotateEntityPlugin");

    const group = new GroupEntity({
      id: "group",
      position: { x: 200, y: 200 },
    });

    group.on("mousedown", () => {
      console.log("Group was clicked");
    });

    const redSquare = new SquareEntity({
      id: "redSquare",
      color: "#FF0000",
      position: { x: 0, y: 0 },
      size: { x: 50, y: 50 },
    });

    const blueSquare = new SquareEntity({
      id: "blueSquare",
      color: "#0000FF",
      position: { x: 50, y: 50 },
      size: { x: 50, y: 50 },
    });

    group.addChild(redSquare);
    group.addChild(blueSquare);

    this.addEntity(group);

    this.render.startRender();
    this.mouseHandler.start();
    this.startAllPlugins();
  }
}
