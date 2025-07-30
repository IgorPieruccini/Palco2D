import { GroupEntity, Scene, SquareEntity } from "@palco-2d/core";

export class GroupExample extends Scene {
  public async start() {
    const group = new GroupEntity({
      position: { x: 200, y: 200 },
    });

    const redSquare = new SquareEntity({
      color: "#FF0000",
      position: { x: 0, y: 0 },
      size: { x: 50, y: 50 },
    });

    const blueSquare = new SquareEntity({
      color: "#0000FF",
      position: { x: 50, y: 50 },
      size: { x: 50, y: 50 },
    });

    group.addChild(redSquare);
    group.addChild(blueSquare);

    this.addEntity(group);

    this.render.startRender();
    this.mouseHandler.start();
  }
}
