import { BaseEntityProps } from "../types";
import { BaseEntity } from "./BaseEntity";
import { Mask } from "./Mask/Mask";

type GroupEntityProps = Omit<BaseEntityProps, "size">;

export class GroupEntity extends BaseEntity {
  /**
   * Mask Handler to handle the masking of the entity.
   */
  public mask: Mask;

  constructor(props: GroupEntityProps) {
    super({ ...props, size: { x: 1, y: 1 } });
    this.mask = new Mask(this);
  }
}
