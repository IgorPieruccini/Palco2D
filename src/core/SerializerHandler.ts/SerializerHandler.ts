import { BaseEntity } from "../BaseEntity";
import { SquareEntity } from "../SquareEntity";
import { BaseEntityProps, SerializedBaseEntityProps } from "../types";

export interface SerializableClass {
  new(args: BaseEntityProps): BaseEntity;
}

export type SerializableClasses<T = Record<string, SerializableClass>> = T;

const DEFAULT_SERIALIZER_CLASSES: SerializableClasses = {
  baseEntity: BaseEntity,
  squareEntity: SquareEntity,
};

export class SerializerHandler {
  private serializers: SerializableClasses;

  constructor(props: SerializableClasses) {
    this.serializers = { ...DEFAULT_SERIALIZER_CLASSES, ...props };
  }

  public createFromJson(props: SerializedBaseEntityProps): BaseEntity {
    const { type, ...data } = props;

    const serializer = this.serializers[type];

    if (!serializer) {
      throw new Error("Serializer not found");
    }

    const entity = new serializer(data);

    for (const child of props.children) {
      entity.children.push(this.createFromJson(child));
    }

    return entity;
  }
}
