import { AssetHandler } from "../core/AssetHandler";
import { Scene } from "../core/SceneHandler/Scene";
import { SerializerHandler } from "../core/SerializerHandler.ts/SerializerHandler";

export class SerializeExample extends Scene {
  public async start() {
    const serializer = new SerializerHandler({});

    const texture = await AssetHandler().loadPng(
      "frog",
      "assets/ninja-frog-jump.png",
    );

    const entities = [];

    const json = {
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
          texture,
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
      ],
    };

    const entity = serializer.createFromJson(json);

    entity.on("mousedown", () => {
      window.alert(JSON.stringify(entity.serialize()));
    });

    entities.push(entity);

    this.mouseHandler.addEntities(entities);
    this.render.addEntities(entities);

    this.render.startRender();
    this.mouseHandler.start();
  }
}
