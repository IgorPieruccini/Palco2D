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

export class BaseEntity {
  id: string;
  position: Vec2;
  size: Vec2;
  rotation: number;
  isMouseHover: boolean;
  layer: number;
  children: Map<string, BaseEntity>;
  onEntityEvent: EntityEvents;
  parent: BaseEntity | null;
  static: boolean = false;
  globalCompositeOperation: GlobalCompositeOperation = "source-over";
  public quadrant: EntityQuadrant;

  private index: number | null = null;

  private initialSize: Vec2;
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
    SceneHandler.currentScene.mouseHandler.quadrant.updateQuadrants(this);
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
    if (this.quadrant.needToUpdateQuadrant()) {
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
      { x: -this.size.x / 2, y: this.size.y / 2 },
      { x: this.size.x / 2, y: this.size.y / 2 },
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
    this.children.set(child.id, child);
    child.setParent(this);
  }

  removeChild(id: string) {
    this.children.delete(id);
  }

  destroy(plugins?: boolean) {
    if (plugins) {
      this.plugins.forEach((plugin) => {
        plugin.destroy();
      });
    }

    this.children.forEach((child) => {
      child.destroy(plugins);
    });

    if (this.parent) {
      this.parent.removeChild(this.id);
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
    const childrenSerialized = new Map<string, SerializedBaseEntityProps>();
    const iterator = this.children.entries();
    let iteratorResult = iterator.next();
    while (!iteratorResult.done) {
      const [key, child] = iteratorResult.value;
      childrenSerialized.set(key, child.serialize());
      iteratorResult = iterator.next();
    }

    return {
      type: "baseEntity",
      id: this.id,
      position: this.position,
      size: this.size,
      rotation: this.rotation,
      layer: this.layer,
      children: childrenSerialized,
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
    let address = this.id;
    let parent = this.parent;
    while (parent) {
      address = `${parent.id}/${address}`;
      parent = parent.parent;
    }
    return address;
  }
}
