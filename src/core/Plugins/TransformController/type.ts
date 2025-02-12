import { BaseEntity } from "../../BaseEntity";
import { BaseEntityProps } from "../../types";

export type ControllerType = "ml" | "mt" | "mb" | "mr";
export type BoundControllerProps = BaseEntityProps & {
  type: ControllerType;
  connectedEntity: BaseEntity;
  onUpdatePosition: () => void;
};
