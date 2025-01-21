import { Scene } from "../core/SceneHandler/Scene";
import { SerializerHandler } from "../core/SerializerHandler.ts/SerializerHandler";
import { SquareEntity } from "../core/SquareEntity";
import { SerializedBaseEntityProps } from "../core/types";

export class SerializeExample extends Scene {
  public async start() {
    const serializer = new SerializerHandler({});

    const entities = [];

    const json: SerializedBaseEntityProps<
      SerializedBaseEntityProps & { color: string }
    > = {
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
          children: [],
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
