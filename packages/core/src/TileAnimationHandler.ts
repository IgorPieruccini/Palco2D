import { Sprite } from "./Sprite";
import { TileMapType } from "../types";

export class TileAnimationHandler {
  private entity: Sprite;
  private frame: number = 0;
  private speed: number = 10;
  private tileMap: TileMapType;
  private isPlaying: boolean;
  private elapsedTime: number = 0;

  constructor(entity: Sprite) {
    this.entity = entity;
    this.frame = 0;
    this.isPlaying = false;

    const tileMap = entity.getTileMap();
    if (tileMap === undefined)
      throw new Error("Sprite can't be animated without a tileMap.");
    this.tileMap = tileMap;
  }

  public animate(deltaTime: number) {
    if (!this.isPlaying) return;
    this.elapsedTime += deltaTime;

    if (this.elapsedTime >= this.speed) {
      this.elapsedTime = 0;
      this.frame += 1;

      const sequence = this.tileMap.sequence;
      if (this.frame >= sequence.length) this.frame = 0;
      this.entity.setTile(sequence[this.frame]);
    }
  }

  public start() {
    this.isPlaying = true;
  }

  public stop() {
    this.isPlaying = false;
  }

  public setSpeed(speed: number) {
    this.speed = 100 / speed;
  }
}
