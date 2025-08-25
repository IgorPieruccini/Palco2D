import { BaseEntityProps, BoundingBox, Coords, Vec2 } from "../types";
import { BaseEntity } from "./BaseEntity";
import { Mask } from "./Mask/Mask";

type GroupEntityProps = Omit<BaseEntityProps, "size">;

export class GroupEntity extends BaseEntity {
  /**
   * Mask Handler to handle the masking of the entity.
   */
  public mask: Mask;

  /**
   * Unfolded means that the children are accessible and can be interacted with.
   * so if true children can be interacted with.
   * if false the group is intractable but children are not.
   */
  public unfolded: boolean = false;

  constructor(props: GroupEntityProps) {
    super({ ...props, size: { x: 1, y: 1 } });
    this.mask = new Mask(this);
  }

  /**
   * isPointOverEntity in a GroupEntity checks if the point is over any child entity.
   * if so, returns true
   * @param point Vector2
   * @returns
   */
  isPointOverEntity(point: Vec2): boolean {
    for (const [, layer] of this.children) {
      for (const [, child] of layer) {
        const isOverChild = child.isPointOverEntity(point);
        if (isOverChild) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * @override
   */
  public getCoords(): Coords {
    const childrenCoords: Coords[] = [];

    // Flatten the coords
    for (const [, layer] of this.children) {
      for (const [, child] of layer) {
        childrenCoords.push(child.getCoords());
      }
    }

    const allCorners = childrenCoords.flatMap((childrenCoords) => [
      ...childrenCoords.corners,
    ]);

    const xValues = allCorners.map((corner) => corner.x);
    const yValues = allCorners.map((corner) => corner.y);

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

    const corners: Vec2[] = [
      {
        x: positionX,
        y: positionY,
      },
      {
        x: positionX + sizeX,
        y: positionY,
      },
      {
        x: positionX + sizeX,
        y: positionY + sizeY,
      },
      {
        x: positionX,
        y: positionY + sizeY,
      },
    ];

    return {
      boundingBox,
      corners,
    };
  }
}
