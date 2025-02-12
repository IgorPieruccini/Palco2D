import { BaseEntity } from "../../BaseEntity";
import { WorldHandler } from "../../WorldHandler";
import { BoundControllerProps, ControllerType } from "./type";
import { transformControllerUtils } from "./utils";

export class TransformController extends BaseEntity {
  type: ControllerType;
  isDragging: boolean = false;
  startDragPosition: { x: number; y: number } = { x: 0, y: 0 };
  connectedEntity: BaseEntity;
  onUpdatePosition: () => void;

  constructor(props: BoundControllerProps) {
    const { type, connectedEntity, onUpdatePosition, ...rest } = props;

    super(rest);
    this.type = type;
    this.connectedEntity = connectedEntity;
    this.onUpdatePosition = onUpdatePosition;

    this.addEvents();

    // update the size of controller according to zoom
    WorldHandler().subscribeToZoomUpdate((zoom: number) => {
      this.size = {
        x: rest.size.x / zoom,
        y: rest.size.y / zoom,
      };
    });
  }

  addEvents() {
    this.on("mousedown", transformControllerUtils.onMouseDown.bind(this));
    this.on("mouseup", transformControllerUtils.onMouseUp.bind(this));
    this.on("mouseenter", transformControllerUtils.onMouseEnter.bind(this));
    this.on("mouseleave", transformControllerUtils.onMouseLeave.bind(this));
  }

  render(ctx: CanvasRenderingContext2D): void {
    const zoom = WorldHandler().getZoom();
    ctx.fillStyle = "#91AEC1";
    ctx.beginPath();
    ctx.roundRect(
      -this.size.x / 2,
      -this.size.y / 2,
      this.size.x,
      this.size.y,
      5 / zoom,
    );
    ctx.fill();
    ctx.closePath();
  }
}
