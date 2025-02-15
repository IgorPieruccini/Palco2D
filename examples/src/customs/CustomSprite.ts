import { Sprite } from "@palco-2d/core";
import { SpriteProps, Vec2 } from "@palco-2d/core/types";

export class CustomSprite extends Sprite {
  private hoverSize: Vec2;
  private originalSize: Vec2;

  constructor(props: SpriteProps & { hoverSize: Vec2 }) {
    super(props);
    this.hoverSize = props.hoverSize;
    this.originalSize = this.size;
    this.onInit();
  }

  onInit() {
    this.on("mouseenter", () => {
      this.size = this.hoverSize;
    });

    this.on("mouseleave", () => {
      this.size = this.originalSize;
    });
  }

  serialize() {
    return {
      ...super.serialize(),
      hoverColor: this.hoverSize,
    };
  }
}
