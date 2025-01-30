import { Scene } from "../core/SceneHandler/Scene";
import { SerializerHandler } from "../core/SerializerHandler.ts/SerializerHandler";
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
      },
    ];

    const entities = await serializer.createFromJson(json);

    // TODO: find out how to have a better type for objects
    //@ts-expect-error - This is a test
    entities[0].children[3].animation.setSpeed(2);

    //@ts-expect-error - This is a test
    entities[0].children[3].animation?.start();

    entities[0].on("mousedown", () => {
      window.alert(JSON.stringify(entities[0].serialize()));
    });

    entities[1].on("mousedown", () => {
      window.alert(JSON.stringify(entities[1].serialize()));
    });

    entities.push(...entities);

    this.mouseHandler.addEntities(entities);
    this.render.addEntities(entities);

    this.render.startRender();
    this.mouseHandler.start();
  }
}
