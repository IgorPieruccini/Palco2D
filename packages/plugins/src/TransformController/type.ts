import { BaseEntity } from "@palco-2d/core";
import { BaseEntityProps } from "@palco-2d/core/types";

export type ControllerType = "ml" | "mt" | "mb" | "mr";
export type BoundControllerProps = BaseEntityProps & {
  type: ControllerType;
  connectedEntity: BaseEntity;
  onUpdatePosition: () => void;
};
