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

  private collectAssets(
    props: Record<string, any>,
  ): { key: string; url: string }[] {
    const assets: { key: string; url: string }[] = [];

    Object.keys(props).forEach((key) => {
      const value = props[key];
      if (typeof value === "object") {
        if (value.key && value.url) {
          assets.push(value);
        } else {
          const nestedAssets = this.collectAssets(value);
          if (nestedAssets.length) {
            assets.push(...nestedAssets);
          }
        }
      }
    });

    return assets;
  }

  public async createFromJson(props: any): Promise<BaseEntity> {
    const { type, ...data } = props;

    const serializer = this.serializers[type];

    if (!serializer) {
      throw new Error("Serializer not found");
    }

    const entity = new serializer(data);

    if (props.children) {
      for (const child of props.children) {
        const childEntity = await this.createFromJson(child);
        childEntity.parent = entity;
        entity.children.push(childEntity);
      }
    }

    return entity;
  }
}
