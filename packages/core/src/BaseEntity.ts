import { EntityPlugin } from "./EntityPlugin";
import {
  EntityEvents,
  EventsType,
  Vec2,
  BaseEntityProps,
  SerializedBaseEntityProps,
} from "../types";
import {
  generateUUID,
  getMatrixPosition,
  getMatrixRotation,
  getMatrixScale,
  getPositionFromMatrix,
  getRotationAngleFromMatrix,
  getScaleFromMatrix,
  identityMatrix,
  multiplyMatrices,
} from "./utils";
import { EntityQuadrant } from "./QuadrantsHandler/EntityQuadrant";
import { SceneHandler } from "./SceneHandler/SceneHandler";

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
   * The position of the entity in the canvas, relative to the top-left corner.
   * if the entity is a child, the position is relative to the parent.
   */
  public position: Vec2;

  /**
   * The size of the entity in the canvas.
   * if the entity is a child, the size is relative to the parent.
   */
  public size: Vec2;

  /**
   * The rotation of the entity in degrees.
   * if the entity is a child, the rotation is relative to the parent.
   */
  public rotation: number;

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
  onEntityEvent: EntityEvents;

  /**
   * The parent of the entity, if the entity is not a child, the parent is null.
   */
  parent: BaseEntity | null;

  /**
   * If the entity is static, the mouse handler will not trigger any event.
   */
  private static: boolean = false;

  /**
   * The globalCompositeOperation property sets the type of compositing operation to apply when drawing the render method.
   * The default value is source-over.
   */
  globalCompositeOperation: GlobalCompositeOperation = "source-over";

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
   *@deprecated DO NOT USE
   */
  private index: number | null = null;

  /**
   * Used to keep track of the entity scale
   * @private
   */
  private initialSize: Vec2;

  /**
   * Array of EntityPlugins that are attached to the entity,
   * used to extend the entity functionality and rendering.
   * @private
   */
  private plugins: EntityPlugin[] = [];

  constructor(props: BaseEntityProps) {
    this.id = props.id || generateUUID();
    this.position = props.position;
    this.size = props.size;
    this.initialSize = { x: props.size.x, y: props.size.y };
    this.rotation = props.rotation;
    this.isMouseHover = false;
    this.layer = props.layer || 0;
    this.children = new Map();
    this.onEntityEvent = {};
    this.parent = null;
    this.static = props.static || false;
    this.globalCompositeOperation =
      props.globalCompositeOperation || "source-over";
    this.quadrant = new EntityQuadrant(this);
  }

  public on(event: EventsType, callback: () => void) {
    this.onEntityEvent = {
      ...this.onEntityEvent,
      [event]: callback,
    };
  }

  public getScale() {
    return {
      x: this.size.x / this.initialSize.x,
      y: this.size.y / this.initialSize.y,
    };
  }

  public getPivotPosition() {
    return {
      x: this.position.x + this.size.x / 2,
      y: this.position.y + this.size.y / 2,
    };
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.static && this.quadrant.needToUpdateQuadrant()) {
      SceneHandler.currentScene.mouseHandler.quadrant.updateQuadrants(this);
      this.quadrant.shouldUpdate = false;
    }

    this.plugins.forEach((plugin) => {
      plugin.render(ctx);
    });
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

  public getMatrix() {
    let matrix: number[][] = [];
    const scale = this.getScale();
    const mPosition = getMatrixPosition(this.position.x, this.position.y);
    const mScale = getMatrixScale(scale.x, scale.y);
    const mRotation = getMatrixRotation(this.rotation * (Math.PI / 180));

    matrix = multiplyMatrices(mPosition, mRotation);
    matrix = multiplyMatrices(matrix, mScale);
    return matrix;
  }

  public getCoords() {
    const parentMatrix = this.getWorldMatrix();
    const parentRotation = getRotationAngleFromMatrix(parentMatrix);
    const matrix = this.getMatrix();

    const finalMatrix = multiplyMatrices(parentMatrix, matrix);
    const position = getPositionFromMatrix(finalMatrix);

    const corners = [
      { x: -this.size.x / 2, y: -this.size.y / 2 },
      { x: this.size.x / 2, y: -this.size.y / 2 },
      { x: this.size.x / 2, y: this.size.y / 2 },
      { x: -this.size.x / 2, y: this.size.y / 2 },
    ];

    const angle = parentRotation * (180 / Math.PI);
    const finalAngle = this.rotation + angle;
    const rad = finalAngle * (Math.PI / 180);

    const scale = this.getScale();
    const cos = Math.cos(rad) * scale.x;
    const sin = Math.sin(rad) * scale.y;

    return corners.map((corner) => {
      const x = corner.x * cos - corner.y * sin;
      const y = corner.x * sin + corner.y * cos;

      return {
        x: x + position.x,
        y: y + position.y,
      };
    });
  }

  getRelativePostion(mousePosition: Vec2, relativeToParent?: boolean) {
    const matrix = this.getWorldMatrix();

    // parent
    const globalRotation = getRotationAngleFromMatrix(matrix);
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
      x: mouseLocalPosition.x - this.position.x * globalScale.x,
      y: mouseLocalPosition.y - this.position.y * globalScale.y,
    };

    const rad = this.rotation * (Math.PI / 180);
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
  }

  removeChild(address: string) {
    const [layer, id] = address.split(":");
    this.children.get(parseInt(layer))?.delete(id);
  }

  destroy(plugins?: boolean) {
    if (plugins) {
      this.plugins.forEach((plugin) => {
        plugin.destroy();
      });
    }

    this.children.forEach((childMap) => {
      childMap.forEach((child) => {
        child.destroy();
      });
    });

    if (this.parent) {
      this.parent.removeChild(this.getOwnAddress());
    } else {
      SceneHandler.currentScene.render.entities
        .get(this.layer)
        ?.delete(this.id);
    }
  }

  isPointOverEntity(point: Vec2) {
    const relativePosition = this.getRelativePostion(point);

    const matrix = this.getWorldMatrix();
    const globalScale = getScaleFromMatrix(matrix);

    const mousePos = {
      x: relativePosition.x,
      y: relativePosition.y,
    };

    return (
      (-this.size.x * globalScale.x) / 2 <= mousePos.x &&
      (this.size.x * globalScale.x) / 2 >= mousePos.x &&
      (-this.size.y * globalScale.y) / 2 <= mousePos.y &&
      (this.size.y * globalScale.y) / 2 >= mousePos.y
    );
  }

  isObjectInViewport(viewport: { position: Vec2; size: Vec2 }) {
    const globalMatrix = this.getWorldMatrix();
    const positionM = getMatrixPosition(this.position.x, this.position.y);
    const rotationM = getMatrixRotation(this.rotation * (Math.PI / 180));
    const scaleM = getMatrixScale(this.size.x, this.size.y);

    const matrix = multiplyMatrices(
      multiplyMatrices(positionM, rotationM),
      scaleM,
    );
    const matrixResult = multiplyMatrices(globalMatrix, matrix);

    const position = getPositionFromMatrix(matrixResult);
    const size = getScaleFromMatrix(matrixResult);

    if (
      position.x + size.x < viewport.position.x ||
      position.x - size.x > viewport.position.x + viewport.size.x ||
      position.y + size.y < viewport.position.y ||
      position.y - size.x > viewport.position.y + viewport.size.y
    ) {
      return false;
    }
    return true;
  }

  private setParent(parentEntity: BaseEntity) {
    this.parent = parentEntity;
  }

  public serialize(): SerializedBaseEntityProps {
    let serializedChildren: SerializedBaseEntityProps["children"] = [];

    const layers = Array.from(this.children.entries());
    for (const [_, entities] of layers) {
      const entitiesArray = Array.from(entities.entries());
      for (const [_, entity] of entitiesArray) {
        serializedChildren.push(entity.serialize());
      }
    }

    return {
      type: "baseEntity",
      id: this.id,
      position: this.position,
      size: this.size,
      rotation: this.rotation,
      layer: this.layer,
      children: serializedChildren,
      address: this.getIdAdress(),
    };
  }

  public addPlugin(plugin: EntityPlugin) {
    this.plugins.push(plugin);
  }

  public getPluginByKey(key: string) {
    return this.plugins.find((plugin) => plugin.key === key);
  }

  public removePluginByKey(key: string) {
    const pluginIndex = this.plugins.findIndex((plugin) => plugin.key === key);
    this.plugins[pluginIndex].destroy();
    this.plugins.splice(pluginIndex, 1);
  }

  public removeAllPlugins() {
    for (const plugin of this.plugins) {
      plugin.destroy();
    }

    this.plugins = [];
  }

  public setIndex(index: number) {
    this.index = index;
  }

  public getIndex() {
    return this.index;
  }

  public getIdAdress() {
    const parents = this.getAllParents();

    const address = parents.reduce((acc, parent) => {
      return `${acc}/${parent.layer}:${parent.id}`;
    }, `${this.layer}:${this.id}`);

    return address;
  }

  private getOwnAddress() {
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
