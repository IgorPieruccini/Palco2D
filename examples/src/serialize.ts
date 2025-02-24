import { Scene, Sprite, SerializerHandler } from "@palco-2d/core";
import { CustomSprite } from "./customs/CustomSprite";

export class SerializeExample extends Scene {
  public async start() {
    const serializer = new SerializerHandler({
      CustomSprite,
    });

    const json = [
      {
        type: "squareEntity",
        id: "1",
        position: { x: 200, y: 200 },
        size: { x: 100, y: 100 },
        rotation: 0,
        layer: 0,
        static: false,
        globalCompositeOperation: "source-over",
        color: "#eab676",
        children: [
          {
            type: "squareEntity",
            id: "2",
            position: { x: 100, y: 100 },
            size: { x: 100, y: 100 },
            rotation: 0,
            layer: 0,
            static: false,
            globalCompositeOperation: "source-over",
            color: "red",
            address: "2/1",
          },
          {
            type: "spriteEntity",
            id: "3",
            position: { x: 0, y: 100 },
            size: { x: 100, y: 100 },
            rotation: 0,
            layer: 0,
            static: false,
            globalCompositeOperation: "source-over",
            texture: "assets/ninja-frog-jump.png",
            address: "3/1",
          },
          {
            type: "textEntity",
            id: "4",
            position: { x: 0, y: -100 },
            size: { x: 10, y: 20 },
            rotation: 0,
            layer: 0,
            static: false,
            globalCompositeOperation: "source-over",
            text: "Serialize Example",
            font: "Arial",
            fontSize: 24,
            color: "black",
            address: "4/1",
          },
          {
            type: "spriteEntity",
            id: "5",
            position: { x: 100, y: 100 },
            size: { x: 120, y: 100 },
            rotation: 0,
            layer: 0,
            static: false,
            globalCompositeOperation: "source-over",
            texture: "assets/ninja-frog-run.png",
            tileMap: "assets/ninja-frog-run.tilemap.json",
            address: "5/1",
          },
        ],
      },
      {
        type: "CustomSprite",
        id: "6",
        position: { x: 400, y: 200 },
        size: { x: 100, y: 100 },
        rotation: 0,
        layer: 0,
        static: false,
        globalCompositeOperation: "source-over",
        texture: "assets/ninja-frog-jump.png",
        hoverSize: { x: 120, y: 120 },
        address: "6",
      },
    ];

    const entities = await serializer.createFromJson(json);

    entities.push(...entities);

    this.mouseHandler.addEntities(entities);
    this.render.addEntities(entities);

    const animatedSprite = this.getEntityByAddress("5/1");
    if (animatedSprite instanceof Sprite) {
      animatedSprite.animation?.setSpeed(2);
      animatedSprite.animation?.start();
    }

    const firstEnity = this.getEntityByAddress("1");
    firstEnity?.on("mousedown", () => {
      window.alert(JSON.stringify(entities[0].serialize()));
    });

    const customEntity = this.getEntityByAddress("6");
    customEntity?.on("mousedown", () => {
      window.alert(JSON.stringify(entities[1].serialize()));
    });

    this.render.startRender();
    this.mouseHandler.start();
  }
}
