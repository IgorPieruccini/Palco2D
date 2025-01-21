export type Vec2 = { x: number; y: number };

export type LastClickPosition = {
  pointer: Vec2;
  entity: Vec2;
};

export type Matrix = number[][];

export type EventsType =
  | "mousedown"
  | "mouseup"
  | "mouseenter"
  | "mouseleave"
  | "mousehover";
export type EntityEvents = Partial<Record<EventsType, () => void>>;

export type CanvasEventType = "mousemove" | "mousedown" | "mouseup";
export type CanvasEvent = Partial<Record<CanvasEventType, () => void>>;

export type BaseTile = { x: number; y: number; width: number; height: number };
export type TileMapType = {
  name?: string;
  size: {
    x: number;
    y: number;
  };
  map: { [key: string]: BaseTile };
  sequence: string[];
};

export type SupportedAssetsExtention = "png" | "json";

export type JsonType = { [key: string]: string | number | JsonType };
export type SupportedAssetsType = HTMLImageElement | JSON | TileMapType;

export interface BaseEntityProps {
  position: Vec2;
  size: Vec2;
  rotation: number;
  layer?: number;
  id?: string;
  static?: boolean;
  globalCompositeOperation?: GlobalCompositeOperation;
}

export type SerializedBaseEntityProps<
  T extends BaseEntityProps = BaseEntityProps,
> = T & {
  type: string;
  children: SerializedBaseEntityProps<T>[];
};
