import { AssetHandler } from "../AssetHandler";
import { BaseEntity } from "../BaseEntity";
import { Sprite } from "../Sprite";
import { SquareEntity } from "../SquareEntity";
import { Text } from "../Text";

export interface SerializableClass {
  new(args: any): BaseEntity;
}

export type SerializableClasses<T = Record<string, SerializableClass>> = T;

const DEFAULT_ASSET_PROPERTIES = ["texture", "tileMap"];
type AssetProperties = (typeof DEFAULT_ASSET_PROPERTIES)[number];
type AssetsCollection = { key: AssetProperties; url: string }[];

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

  private collectAssets(props: Record<string, any>): AssetsCollection {
    const urls: AssetsCollection = [];

    Object.keys(props).forEach((key) => {
      const value = props[key];

      if (typeof value === "object") {
        const collectedAssets = this.collectAssets(value);
        urls.push(...collectedAssets);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          const collectedAsserts = this.collectAssets(item);
          urls.push(...collectedAsserts);
        });
      } else if (DEFAULT_ASSET_PROPERTIES.includes(key)) {
        urls.push({ key, url: value });
      }
    });

    return urls;
  }

  private async loadAssets(assets: AssetsCollection) {
    for (const asset of assets) {
      switch (asset.key) {
        case "texture":
          await AssetHandler().loadPng(asset.url);
          break;
        case "tileMap":
          await AssetHandler().loadTileMap(asset.url);
          break;
      }
    }
  }

  public async createFromJson(props: any): Promise<BaseEntity> {
    const { type, ...data } = props;

    const assetsCollection = this.collectAssets(props);
    await this.loadAssets(assetsCollection);

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
