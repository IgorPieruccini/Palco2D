import { EntityEvents, Matrix, EventsType, Vec2 } from './types'
import { getMatrixPosition, getMatrixRotation, getPositionFromMatrix, getRotationAngleFromMatrix, identityMatrix, multiplyMatrices } from './utils';

export interface BaseEntityProps {
  position: Vec2;
  size: Vec2;
  rotation: number;
  layer?: number;
  id?: number;
}

export class BaseEntity {
  id: number;
  position: Vec2;
  size: Vec2;
  rotation: number;
  isMouseHover: boolean;
  layer: number;
  children: BaseEntity[];
  onEntityEvent: EntityEvents;
  parent: BaseEntity | null;

  private initialSize: Vec2;

  constructor(props: BaseEntityProps) {
    this.id = props.id || Math.random();
    this.position = props.position;
    this.size = props.size;
    this.initialSize = { x: props.size.x, y: props.size.y };
    this.rotation = props.rotation;
    this.isMouseHover = false;
    this.layer = props.layer || 0;
    this.children = [];
    this.onEntityEvent = {};
    this.parent = null;
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

  getRelativePostion(mousePosition: Vec2, relativeToParent?: boolean) {
    const getAllParents = () => {
      let parent = this.parent;
      const parents: BaseEntity[] = [];
      while (parent) {
        parents.push(parent);
        parent = parent.parent;
      }
      return parents;
    }


    const getMatrix = (parents: BaseEntity[]) => {
      let matrix = identityMatrix;
      for (let i = parents.length - 1; i >= 0; i--) {
        const parent = parents[i];
        const position = parent.position;
        const angle = parent.rotation;

        const positionM = getMatrixPosition(position.x, position.y);
        const rad = angle * (Math.PI / 180);
        const rotationM = getMatrixRotation(rad);
        const matrixResult = multiplyMatrices(positionM, rotationM);

        const transformedMatrix = multiplyMatrices(matrix, matrixResult);

        matrix = transformedMatrix;
      }
      return matrix;
    }

    const getMouseRelativePosition = (matrix: Matrix, vec: Vec2) => {
      // parent
      const globalRotation = getRotationAngleFromMatrix(matrix);
      const globalPosition = getPositionFromMatrix(matrix);

      const cosAngle = Math.cos(-globalRotation);
      const sinAngle = Math.sin(-globalRotation);

      const translatedMousePosition = {
        x: vec.x - globalPosition.x,
        y: vec.y - globalPosition.y
      }

      const mouseLocalPosition = {
        x: translatedMousePosition.x * cosAngle - translatedMousePosition.y * sinAngle,
        y: translatedMousePosition.x * sinAngle + translatedMousePosition.y * cosAngle
      }

      if (relativeToParent)
        return mouseLocalPosition;

      // child
      const translatedMousePositionChild = {
        x: mouseLocalPosition.x - this.position.x,
        y: mouseLocalPosition.y - this.position.y
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

    const parents = getAllParents();
    const matrix = getMatrix(parents);
    const pos = getMouseRelativePosition(matrix, mousePosition);

    return pos;
  }

  addChild(child: BaseEntity) {
    this.children.push(child);
    child.setParent(this);
  }

  private setParent(parentEntity: BaseEntity) {
    this.parent = parentEntity;
  }
}
