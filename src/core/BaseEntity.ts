import { EntityEvents, Matrix, EventsType, Vec2 } from './types'
import { generateUUID, getMatrixPosition, getMatrixRotation, getMatrixScale, getPositionFromMatrix, getRotationAngleFromMatrix, getScaleFromMatrix, identityMatrix, multiplyMatrices } from './utils';

export interface BaseEntityProps {
  position: Vec2;
  size: Vec2;
  rotation: number;
  layer?: number;
  id?: string;
  static?: boolean;
}

export class BaseEntity {
  id: string;
  position: Vec2;
  size: Vec2;
  rotation: number;
  isMouseHover: boolean;
  layer: number;
  children: BaseEntity[];
  onEntityEvent: EntityEvents;
  parent: BaseEntity | null;
  static: boolean = false;

  private initialSize: Vec2;

  constructor(props: BaseEntityProps) {
    this.id = props.id || generateUUID();
    this.position = props.position;
    this.size = props.size;
    this.initialSize = { x: props.size.x, y: props.size.y };
    this.rotation = props.rotation;
    this.isMouseHover = false;
    this.layer = props.layer || 0;
    this.children = [];
    this.onEntityEvent = {};
    this.parent = null;
    this.static = props.static || false;
  }

  public on(event: EventsType, callback: () => void) {
    this.onEntityEvent = {
      ...this.onEntityEvent,
      [event]: callback
    }
  }

  public getScale() {
    return {
      x: this.size.x / this.initialSize.x,
      y: this.size.y / this.initialSize.y
    }
  }

  public getPivotPosition() {
    return {
      x: this.position.x + this.size.x / 2,
      y: this.position.y + this.size.y / 2
    }
  }

  render(ctx: CanvasRenderingContext2D) { }


  private getAllParents() {
    let parent = this.parent;
    const parents: BaseEntity[] = [];
    while (parent) {
      parents.push(parent);
      parent = parent.parent;
    }
    return parents;
  }

  getMatrix() {
    const parents = this.getAllParents();

    let matrix = identityMatrix;

    for (let i = parents.length - 1; i >= 0; i--) {
      const parent = parents[i];
      const position = parent.position;
      const angle = parent.rotation;

      const rad = angle * (Math.PI / 180);


      const positionM = getMatrixPosition(position.x, position.y);
      const rotationM = getMatrixRotation(rad);
      const scale = parent.getScale();
      const scaleM = getMatrixScale(scale.x, scale.y);

      const matrixResult = multiplyMatrices(multiplyMatrices(positionM, rotationM), scaleM);

      const transformedMatrix = multiplyMatrices(matrix, matrixResult);

      matrix = transformedMatrix;
    }
    return matrix;
  }

  getRelativePostion(mousePosition: Vec2, relativeToParent?: boolean) {
    const matrix = this.getMatrix();

    // parent
    const globalRotation = getRotationAngleFromMatrix(matrix);
    const globalPosition = getPositionFromMatrix(matrix);
    const globalScale = getScaleFromMatrix(matrix);

    const cosAngle = Math.cos(-globalRotation);
    const sinAngle = Math.sin(-globalRotation);

    const translatedMousePosition = {
      x: mousePosition.x - globalPosition.x,
      y: mousePosition.y - globalPosition.y
    }

    const mouseLocalPosition = {
      x: translatedMousePosition.x * cosAngle - translatedMousePosition.y * sinAngle,
      y: translatedMousePosition.x * sinAngle + translatedMousePosition.y * cosAngle
    }

    if (relativeToParent)
      return {
        x: mouseLocalPosition.x / globalScale.x,
        y: mouseLocalPosition.y / globalScale.y
      }

    // child
    const translatedMousePositionChild = {
      x: mouseLocalPosition.x - (this.position.x * globalScale.x),
      y: mouseLocalPosition.y - (this.position.y * globalScale.y)
    }

    const rad = this.rotation * (Math.PI / 180);
    const cosAngleChild = Math.cos(-rad);
    const sinAngleChild = Math.sin(-rad);

    const mouseLocalPositionChild = {
      x: translatedMousePositionChild.x * cosAngleChild - translatedMousePositionChild.y * sinAngleChild,
      y: translatedMousePositionChild.x * sinAngleChild + translatedMousePositionChild.y * cosAngleChild
    }

    return {
      x: mouseLocalPositionChild.x,
      y: mouseLocalPositionChild.y
    }
  }

  addChild(child: BaseEntity) {
    this.children.push(child);
    child.setParent(this);
  }

  isObjectInViewport(viewport: { position: Vec2, size: Vec2 }) {
    if (
      this.position.x + this.size.x < viewport.position.x ||
      this.position.x > viewport.position.x + viewport.size.x ||
      this.position.y + this.size.y < viewport.position.y ||
      this.position.y > viewport.position.y + viewport.size.y) {
      return false;
    }
    return true;
  }

  private setParent(parentEntity: BaseEntity) {
    this.parent = parentEntity;
  }
}
