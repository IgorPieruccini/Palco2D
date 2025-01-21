import { BaseEntity } from "../BaseEntity";
import { Sprite } from "../Sprite";
import { SquareEntity } from "../SquareEntity";
import { Text } from "../Text";

export interface SerializableClass {
  new(args: any): BaseEntity;
}

export type SerializableClasses<T = Record<string, SerializableClass>> = T;

const DEFAULT_SERIALIZER_CLASSES: SerializableClasses = {
  baseEntity: BaseEntity,
  squareEntity: SquareEntity,
  spriteEntity: Sprite,
  textEntity: Text,
};

export class SerializerHandler {
  private serializers: SerializableClasses;

  constructor(props: SerializableClasses) {
    this.serializers = { ...DEFAULT_SERIALIZER_CLASSES, ...props };
  }

  public createFromJson(props: any): BaseEntity {
    const { type, ...data } = props;

    const serializer = this.serializers[type];

    if (!serializer) {
      throw new Error("Serializer not found");
    }

    const entity = new serializer(data);

    if (props.children) {
      for (const child of props.children) {
        entity.children.push(this.createFromJson(child));
      }
    }

    return entity;
  }
}
