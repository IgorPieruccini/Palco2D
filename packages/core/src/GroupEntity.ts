import { BaseEntityProps, Vec2 } from "../types";
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
}
