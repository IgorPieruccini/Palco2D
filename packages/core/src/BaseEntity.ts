import {
  EntityEvents,
  EventsType,
  Vec2,
  BaseEntityProps,
  SerializedBaseEntityProps,
  Coords,
  BoundingBox,
} from "../types";
import {
  generateUUID,
  getMatrixPosition,
  getMatrixRotation,
  getMatrixScale,
  getPositionFromMatrix,
  getRadFromMatrix,
  getScaleFromMatrix,
  identityMatrix,
  multiplyMatrices,
} from "./utils";
import { EntityQuadrant } from "./QuadrantsHandler/EntityQuadrant";
import { SceneHandler } from "./SceneHandler/SceneHandler";
import { Mask } from "./Mask/Mask";

/**
 *
 * BaseEntity serves as the foundational class for all entities managed by the rendering and mouse handling systems.
 * It encapsulates the essential properties and methods shared across all entities, ensuring seamless integration with rendering and interactive functionalities.
 * Any custom entity should extend this class to be properly managed by the engine, maintaining consistency in interactivity and rendering behavior
 */
export class BaseEntity {
  /**
   * The unique id of the entity.
   */
  public id: string;

  /**
   * Do not use this property directly, use the position property instead.
   */
  private _position: Vec2;
  /**
   * The position of the entity in the canvas, relative to the top-left corner.
   * if the entity is a child, the position is relative to the parent.
   */
  public get position() {
    return this._position;
  }

  public set position(position: Vec2) {
    this._position = position;
    this.updateTransform();

    if (this.parent?.mask.useAsMask) {
      this.parent.mask.forceUpdate();
    }
  }

  /**
   * Do not use this property directly, use the size property instead.
   */
  private _size: Vec2;

  /**
   * The size of the entity in the canvas.
   * if the entity is a child, the size is relative to the parent.
   */
  public get size() {
    const scale = this.getScale();
    return {
      x: this._size.x / scale.x,
      y: this._size.y / scale.y,
    };
  }

  public set size(size: Vec2) {
    this._size = size;
    this.updateTransform();

    // when initializing a entity the size might not be set as it needs to load from src, in this case
    // we watch when the size is set, and then update the mask, only if the cache is false
    if (this.mask.useAsMask && !this.mask.cached) {
      this.mask.updateCanvasSize();
    }

    if (this.parent?.mask.useAsMask) {
      this.parent.mask.forceUpdate();
    }
  }

  /**
   * The size of the element property (not considering canvas transformation)
   * @returns Vec2
   */
  public get realSize() {
    return this._size;
  }

  /**
   * The coordinates of the entity in the canvas.
   * represents the for corners of the entity in the canvas,
   * and the bounding box of that these corners describes.
   */
  public coords: Coords = {
    corners: [],
    boundingBox: {
      x: Infinity,
      y: Infinity,
      width: Infinity,
      height: Infinity,
    },
  };

  /**
   * The matrix of the entity, used to calculate the transformation of the entity.
   */
  public matrix: number[][] = [];

  /**
   * The rotation of the entity in degrees.
   * if the entity is a child, the rotation is relative to the parent.
   */
  private _rotation: number;

  public get rotation() {
    return this._rotation;
  }

  public set rotation(rotation: number) {
    this._rotation = rotation;

    this.updateTransform();

    if (this.parent?.mask.useAsMask) {
      this.parent.mask.forceUpdate();
    }
  }

  /**
   * If the mouse is hovering the entity it returns true, otherwise false.
   */
  public isMouseHover: boolean;

  /**
   * The layer of the entity represents the order the render handler will render the entity.
   * 0 is the first layer, and the entities with higher layers will be rendered on top of the entities with lower layers.
   * The layer is relative to the parent, so if the entity is a child, the layer is relative to the parent.
   * If the entity has a layer equal to 0, and the parent has a layer equal to 10,
   * any entity with layer less than 10, that's not a child of a parent, will be rendered before.
   */
  public layer: number;

  /**
   * A map representing the children organized by layers.
   * ```
   * [
   *  [layer]: [
   *    [id]: BaseEntity
   *  ]
   * ]
   * ```
   */
  public children: Map<number, Map<string, BaseEntity>>;

  /**
   * A record of events that the entity has subscribed to.
   * Mouse handler will trigger these events depending on the interaction with the entity.
   * if the entity is static, the mouse handler will not trigger any event.
   */
  public onEntityEvent: EntityEvents = new Map();

  /**
   * Mask Handler to handle the masking of the entity.
   */
  public mask: Mask;

  /**
   * When set to true children elements will be masked
   * Note: When using and element as a mask globalCompositeOperation does not take effect
   */
  public get useAsMask() {
    return this.mask.useAsMask;
  }

  public set useAsMask(enable: boolean) {
    if (enable) {
      this.mask.setAsMask();
    } else {
      this.mask.disableMask();
    }
  }

  /**
   * The parent of the entity, if the entity is not a child, the parent is null.
   */
  private _parent: BaseEntity | null = null;

  public get parent() {
    return this._parent;
  }

  public set parent(parent: BaseEntity | null) {
    this._parent = parent;

    this.updateTransform();
  }

  /**
   * If the entity is static, the mouse handler will not trigger any event.
   */
  private static: boolean = false;

  /**
   * When isUI is set to true the entity will be render in the upper canvas,
   * when the mouse detection will preoritize the UI entities over others.
   */
  public isUI: boolean = false;

  /**
   * The globalCompositeOperation property sets the type of compositing operation to apply when drawing the render method.
   * The default value is source-over.
   */
  public globalCompositeOperation: GlobalCompositeOperation = "source-over";

  /**
   *  The canvas is divided into quadrants, and each entity is assigned to a quadrant.
   *  these quadrants are used to optimize the mouse detection over the entities, preventing
   *  the mouse checking for all entities in the canvas, it will only check for the ones within the
   *  same quadrant as the mouse.
   *  quadrant represents all the quadrants the entity is assigned, depending on the transformation of the entity, it can
   *  have assigned multiple quadrants.
   *  The quadrant updated when the entity matrix changes.
   */
  public quadrant: EntityQuadrant;

  /**
   * Used to keep track of the entity scale
   * @private
   */
  protected initialSize: Vec2;

  private updateTransform() {
    this.coords = this.getCoords();
    this.matrix = this.getMatrix();

    this.children.forEach((layer) => {
      layer.forEach((child) => {
        child.updateTransform();
      });
    });
  }

  constructor(props: BaseEntityProps) {
    this.id = props.id || generateUUID();
    this._position = props.position;
    this._size = props.size;
    this.initialSize = { x: props.size.x, y: props.size.y };
    this._rotation = props.rotation || 0;
    this.isMouseHover = false;
    this.layer = props.layer || 0;
    this.children = new Map();
    this.parent = null;
    this.static = props.static || false;
    this.globalCompositeOperation =
      props.globalCompositeOperation || "source-over";
    this.quadrant = new EntityQuadrant(this);
    this.updateTransform();
    this.isUI = props.isUI || false;
    this.mask = new Mask(this);
    if (props.useAsMask) {
      this.useAsMask = true;
    }
  }

  public on(event: EventsType, callback: () => void) {
    const events = this.onEntityEvent.get(event);
    this.onEntityEvent.set(event, [...(events || []), callback]);
  }

  public getScale() {
    if (this._size.x === Infinity || this._size.y === Infinity) {
      return {
        x: 1,
        y: 1,
      };
    }

    return {
      x: this._size.x / this.initialSize.x,
      y: this._size.y / this.initialSize.y,
    };
  }

  public getPivotPosition() {
    return {
      x: this._position.x + this._size.x / 2,
      y: this._position.y + this._size.y / 2,
    };
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.static && this.quadrant.needToUpdateQuadrant()) {
      SceneHandler.currentScene.mouseHandler.quadrant.updateQuadrants(this);
      this.quadrant.shouldUpdate = false;
    }
  }

  private getAllParents() {
    let parent = this.parent;
    const parents: BaseEntity[] = [];
    while (parent) {
      parents.push(parent);
      parent = parent.parent;
    }
    return parents;
  }

  public getWorldMatrix() {
    const parents = this.getAllParents();

    let matrix = identityMatrix;

    for (let i = parents.length - 1; i >= 0; i--) {
      const parent = parents[i];

      const matrixResult = parent.getMatrix();

      const transformedMatrix = multiplyMatrices(matrix, matrixResult);

      matrix = transformedMatrix;
    }
    return matrix;
  }

  /**
   * Gets the transformation matrix of the entity,
   */
  protected getMatrix() {
    let matrix: number[][] = [];
    const scale = this.getScale();
    const mPosition = getMatrixPosition(this._position.x, this.position.y);
    const mScale = getMatrixScale(scale.x, scale.y);
    const mRotation = getMatrixRotation(this._rotation * (Math.PI / 180));

    matrix = multiplyMatrices(mPosition, mRotation);
    matrix = multiplyMatrices(matrix, mScale);
    return matrix;
  }

  /**
   * Gets the coords of the entity in the canvas.
   * the coords are the corners of the entity in the canvas.
   * eg: top-left, top-right, bottom-right, bottom-left
   */
  protected getCoords(): Coords {
    const parentMatrix = this.getWorldMatrix();
    const parentRotation = getRadFromMatrix(parentMatrix);
    const matrix = this.getMatrix();

    const finalMatrix = multiplyMatrices(parentMatrix, matrix);
    const position = getPositionFromMatrix(finalMatrix);

    const parentScale = getScaleFromMatrix(parentMatrix);

    const scaledSize = {
      x: this._size.x * parentScale.x,
      y: this._size.y * parentScale.y,
    };

    const fixedCorners = [
      { x: -scaledSize.x / 2, y: -scaledSize.y / 2 },
      { x: scaledSize.x / 2, y: -scaledSize.y / 2 },
      { x: scaledSize.x / 2, y: scaledSize.y / 2 },
      { x: -scaledSize.x / 2, y: scaledSize.y / 2 },
    ];

    const angle = parentRotation * (180 / Math.PI);
    const finalAngle = this._rotation + angle;
    const rad = finalAngle * (Math.PI / 180);

    const cos = Math.cos(-rad);
    const sin = Math.sin(rad);

    const corners = fixedCorners.map((corner) => {
      const x = corner.x * cos - corner.y * sin;
      const y = corner.x * sin + corner.y * cos;

      return {
        x: x + position.x,
        y: y + position.y,
      };
    });

    const xValues = corners.map((corner) => corner.x);
    const yValues = corners.map((corner) => corner.y);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const positionX = minX + sizeX / 2;
    const positionY = minY + sizeY / 2;

    const boundingBox: BoundingBox = {
      x: positionX,
      y: positionY,
      width: sizeX,
      height: sizeY,
    };

    return {
      corners,
      boundingBox,
    };
  }

  getRelativePosition(mousePosition: Vec2, relativeToParent?: boolean) {
    const matrix = this.getWorldMatrix();

    // parent
    const globalRotation = getRadFromMatrix(matrix);
    const globalPosition = getPositionFromMatrix(matrix);
    const globalScale = getScaleFromMatrix(matrix);

    const cosAngle = Math.cos(-globalRotation);
    const sinAngle = Math.sin(-globalRotation);

    const translatedMousePosition = {
      x: mousePosition.x - globalPosition.x,
      y: mousePosition.y - globalPosition.y,
    };

    const mouseLocalPosition = {
      x:
        translatedMousePosition.x * cosAngle -
        translatedMousePosition.y * sinAngle,
      y:
        translatedMousePosition.x * sinAngle +
        translatedMousePosition.y * cosAngle,
    };

    if (relativeToParent)
      return {
        x: mouseLocalPosition.x / globalScale.x,
        y: mouseLocalPosition.y / globalScale.y,
      };

    // child
    const translatedMousePositionChild = {
      x: mouseLocalPosition.x - this._position.x * globalScale.x,
      y: mouseLocalPosition.y - this._position.y * globalScale.y,
    };

    const rad = this._rotation * (Math.PI / 180);
    const cosAngleChild = Math.cos(-rad);
    const sinAngleChild = Math.sin(-rad);

    const mouseLocalPositionChild = {
      x:
        translatedMousePositionChild.x * cosAngleChild -
        translatedMousePositionChild.y * sinAngleChild,
      y:
        translatedMousePositionChild.x * sinAngleChild +
        translatedMousePositionChild.y * cosAngleChild,
    };

    return {
      x: mouseLocalPositionChild.x,
      y: mouseLocalPositionChild.y,
    };
  }

  addChild(child: BaseEntity) {
    const layer = child.layer;

    let layerMap = this.children.get(layer);

    if (!layerMap) {
      const map = new Map();
      this.children.set(layer, map);
      layerMap = map;
    }

    layerMap.set(child.id, child);
    child.setParent(this);

    SceneHandler.currentScene.eventHandler.notify("addChild", child);
  }

  removeChild(address: string) {
    const [layer, id] = address.split(":");
    const child = this.children.get(parseInt(layer))?.get(id);
    if (!child) {
      throw new Error(`Entity with address ${address} not found`);
    }

    this.children.get(parseInt(layer))?.delete(id);
    SceneHandler.currentScene.mouseHandler.removeEntity(child);
    SceneHandler.currentScene.eventHandler.notify("removeChild", child);
  }

  destroy() {
    this.children.forEach((childMap) => {
      childMap.forEach((child) => {
        child.destroy();
      });
    });

    this.onEntityEvent.clear();

    if (this.parent) {
      this.parent.removeChild(this.getOwnAddress());
    } else {
      SceneHandler.currentScene.render.entities
        .get(this.layer)
        ?.delete(this.id);

      SceneHandler.currentScene.mouseHandler.removeEntity(this);
    }
  }

  /**
   * Check if the point is over the entity.
   */
  isPointOverEntity(point: Vec2) {
    const relativePosition = this.getRelativePosition(point);

    const matrix = this.getWorldMatrix();
    const globalScale = getScaleFromMatrix(matrix);

    const mousePos = {
      x: relativePosition.x,
      y: relativePosition.y,
    };

    // In case the entity is flipped (width or height negative)
    const sizeX = Math.abs(this._size.x);
    const sizeY = Math.abs(this._size.y);

    return (
      (-sizeX * globalScale.x) / 2 <= mousePos.x &&
      (sizeX * globalScale.x) / 2 >= mousePos.x &&
      (-sizeY * globalScale.y) / 2 <= mousePos.y &&
      (sizeY * globalScale.y) / 2 >= mousePos.y
    );
  }

  isObjectInViewport(viewport: { position: Vec2; size: Vec2 }) {
    const { boundingBox } = this.getCoords();

    let inViewport = false;

    if (
      boundingBox.x + boundingBox.width / 2 - viewport.position.x >= 0 &&
      boundingBox.x - boundingBox.width / 2 - viewport.position.x <=
        viewport.size.x &&
      boundingBox.y + boundingBox.height / 2 - viewport.position.y >= 0 &&
      boundingBox.y - boundingBox.height / 2 - viewport.position.y <=
        viewport.size.y
    ) {
      inViewport = true;
    }

    return inViewport;
  }

  private setParent(parentEntity: BaseEntity) {
    this.parent = parentEntity;
  }

  public serialize(): SerializedBaseEntityProps {
    const serializedChildren: SerializedBaseEntityProps["children"] = [];

    const layers = Array.from(this.children.entries());
    for (const [, entities] of layers) {
      const entitiesArray = Array.from(entities.entries());
      for (const [, entity] of entitiesArray) {
        serializedChildren.push(entity.serialize());
      }
    }

    return {
      type: "baseEntity",
      id: this.id,
      position: this._position,
      size: this._size,
      rotation: this._rotation,
      layer: this.layer,
      children: serializedChildren,
      address: this.getIdAddress(),
    };
  }

  /**
   * Get the string address of the entity.
   * With the address id you can get any entity in the scene, it represents the path to the entity.
   * @example
   * {layer}:{id}/{layer}:{id}/{layer}:{id}
   *
   * the first layer and id is the entity itself, the next layers and ids are the parents of the entity.
   */
  public getIdAddress() {
    const parents = this.getAllParents();

    const address = parents.reduce((acc, parent) => {
      return `${acc}/${parent.layer}:${parent.id}`;
    }, `${this.layer}:${this.id}`);

    return address;
  }

  public getOwnAddress() {
    return `${this.layer}:${this.id}`;
  }

  public setStatic(staticValue: boolean) {
    SceneHandler.currentScene.mouseHandler.quadrant.updateQuadrants(this);
    this.static = staticValue;
  }

  public getStatic() {
    return this.static;
  }
}
