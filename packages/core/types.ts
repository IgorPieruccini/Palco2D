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

export type SVGCommand =
  | ["M", number, number]
  | ["m", number, number]
  | ["L", number, number]
  | ["l", number, number]
  | ["H", number]
  | ["h", number]
  | ["V", number]
  | ["v", number]
  | ["C", number, number, number, number, number, number]
  | ["c", number, number, number, number, number, number]
  | ["S", number, number, number, number]
  | ["s", number, number, number, number]
  | ["Q", number, number, number, number]
  | ["q", number, number, number, number]
  | ["T", number, number]
  | ["t", number, number]
  | ["A", number, number, number, number, number, number, number, number]
  | ["a", number, number, number, number, number, number, number, number]
  | ["Z"]
  | ["z"];

export type SVGCommandKey = SVGCommand[0];

export type CachedSVGAsset = {
  coordinates: string;
  commands: SVGCommand[];
  matrix: number[][];
  translate: Vec2;
  fill: string;
  fillRule: string;
  opacity: string;
  stroke: string;
  strokeDasharray: string;
  strokeDashoffset: string;
  strokeLinecap: string;
  strokeLinejoin: string;
  strokeMiterlimit: string;
  strokeWidth: string;
};

export type SVGData = Omit<CachedSVGAsset, "coordinates" | "strokeWidth"> & {
  coordinates: Path2D;
  strokeWidth: number;
};

export type SupportedAssetsExtention = "png" | "json";

export type JsonType = { [key: string]: string | number | JsonType };
export type SupportedAssetsType =
  | HTMLImageElement
  | JSON
  | TileMapType
  | CachedSVGAsset[];

export interface BaseEntityProps {
  position: Vec2;
  size: Vec2;
  rotation: number;
  layer?: number;
  id?: string;
  static?: boolean;
  globalCompositeOperation?: GlobalCompositeOperation;
}

export type SpriteProps = Omit<BaseEntityProps, "size"> & {
  texture: string;
  tileMap?: string;
};

export type SVGImageProps = Omit<BaseEntityProps, "size"> & {
  src: string;
};

export type Path2DProps = Omit<BaseEntityProps, "position"> & {
  svgData: SVGData;
  /**
   * Then unfolding the SVGImageEntity bounding box used to center the image,
   * this centering adds an offset that needs to be passed to paths when unfolding them.
   */
  offset: Vec2;
};

export type SerializedBaseEntityProps<
  T extends BaseEntityProps = BaseEntityProps,
> = T & {
  type: string;
  children: SerializedBaseEntityProps[];
  address: string;
};

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};
