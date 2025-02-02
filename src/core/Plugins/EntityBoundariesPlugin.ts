import { BaseEntity } from "../BaseEntity";
import { EntityPlugin } from "../EntityPlugin";
import { WorldHandler } from "../WorldHandler";

export class EnityBoundariesPlugin extends EntityPlugin {
  constructor(entity: BaseEntity, key: string) {
    super(entity, key);
  }

  public render(ctx: CanvasRenderingContext2D) {
    const { size } = this.entity;

    const zoom = WorldHandler().getZoom();

    ctx.strokeStyle = "#91AEC1";
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(-size.x / 2, -size.y / 2, size.x, size.y);
  }
}
