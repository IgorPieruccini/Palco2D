import { BaseEntityProps } from "../types";
import { BaseEntity } from "./BaseEntity";
import { Mask } from "./Mask/Mask";

export class GroupEntity extends BaseEntity {
  /**
   * Mask Handler to handle the masking of the entity.
   */
  public mask: Mask;

  constructor(props: BaseEntityProps) {
    super(props);
    this.mask = new Mask(this);
  }
}
