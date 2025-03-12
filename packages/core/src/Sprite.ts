import { AssetHandler } from "./AssetHandler";
import { BaseEntity } from "./BaseEntity";
import { TileAnimationHandler } from "./TileAnimationHandler";
import { BaseEntityProps, BaseTile, TileMapType } from "../types";

type SpriteProps = Omit<BaseEntityProps, "size"> & {
  texture: string;
  tileMap?: string;
};

export class Sprite extends BaseEntity {
  private texture: HTMLImageElement;
  private tileMap: TileMapType | undefined;
  private currentTile: BaseTile;
  animation: TileAnimationHandler | undefined;

  constructor(props: SpriteProps) {
    const { texture, ...rest } = props;
    const loadedTexture = AssetHandler.getAsset<HTMLImageElement>(texture);

    const size = { x: loadedTexture.width, y: loadedTexture.height };

    super({ ...rest, size });

    this.texture = loadedTexture;

    if (props.tileMap) {
      const tileMap = AssetHandler.getAsset<TileMapType>(props.tileMap);
      if (!tileMap) {
        throw new Error(`TileMap with key ${props.tileMap} not found`);
      }
      this.tileMap = tileMap;
    }

    if (this.tileMap) {
      const sequence = this.tileMap.sequence;
      this.size = this.tileMap.size;
      const firstTile = Object.keys(this.tileMap.map)[0];
      this.currentTile = this.tileMap.map[sequence[0] || firstTile];
      this.animation = new TileAnimationHandler(this);
    } else {
      this.currentTile = {
        x: 0,
        y: 0,
        width: this.size.x,
        height: this.size.y,
      };
    }
  }

  setTile(key: string) {
    if (this.tileMap) {
      const tileMapKey = this.tileMap.map[key];
      if (!tileMapKey) {
        throw new Error(`Tile with key ${key} not found`);
      }
      this.currentTile = this.tileMap.map[key];
      this.size = { x: this.currentTile.width, y: this.currentTile.height };
    }
  }

  getTileMap() {
    return this.tileMap;
  }

  canBeAnimated() {
    return this.animation !== undefined;
  }

  animate(fps: number) {
    this.animation?.animate(fps);
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
    if (this.globalCompositeOperation) {
      ctx.globalCompositeOperation = this.globalCompositeOperation;
    }
    ctx.scale(this.size.x < 0 ? -1 : 1, this.size.y < 0 ? -1 : 1);
    ctx.drawImage(
      this.texture,
      this.currentTile.x,
      this.currentTile.y,
      this.currentTile.width,
      this.currentTile.height,
      -this.size.x / 2,
      -this.size.y / 2,
      this.size.x,
      this.size.y,
    );
  }

  serialize() {
    const data = super.serialize();
    return {
      ...data,
      type: "sprite",
      texture: this.texture.src,
    };
  }
}
