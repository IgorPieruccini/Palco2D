import { BaseEntity } from "../../BaseEntity";
import { SceneHandler } from "../../SceneHandler/SceneHandler";
import { Vec2 } from "../../types";
import { TransformController } from "./TransformController";
import { ControllerType } from "./type";

/*
 * @description Get the size of connected entity based
 * on the controller movement (delta - how much controller moved since last tick)
 */
function getSize(this: TransformController, delta: Vec2) {
  switch (this.type) {
    case "ml":
      return {
        x: this.connectedEntity.size.x - delta.x,
        y: this.connectedEntity.size.y,
      };
    case "mt":
      return {
        x: this.connectedEntity.size.x,
        y: this.connectedEntity.size.y - delta.y,
      };
    case "mb":
      return {
        x: this.connectedEntity.size.x,
        y: this.connectedEntity.size.y + delta.y,
      };
    case "mr":
      return {
        x: this.connectedEntity.size.x + delta.x,
        y: this.connectedEntity.size.y,
      };
  }
}

/**
 * @description Get the position of connected entity based
 * on the controller movement (delta - how much controller moved since last tick)
 */
function getPosition(this: TransformController, delta: Vec2) {
  switch (this.type) {
    case "ml":
      return {
        x: this.connectedEntity.position.x + delta.x / 2,
        y: this.connectedEntity.position.y,
      };
    case "mt":
      return {
        x: this.connectedEntity.position.x,
        y: this.connectedEntity.position.y + delta.y / 2,
      };
    case "mb":
      return {
        x: this.connectedEntity.position.x,
        y: this.connectedEntity.position.y + delta.y / 2,
      };
    case "mr":
      return {
        x: this.connectedEntity.position.x + delta.x / 2,
        y: this.connectedEntity.position.y,
      };
  }
}

/**
 * @description
 * Get the position of the controller based on the mouse position
 * and controller type
 */
function getControllerPosition(this: TransformController, mousePosition: Vec2) {
  switch (this.type) {
    case "ml":
    case "mr":
      return {
        x: mousePosition.x,
        y: this.position.y,
      };
    case "mt":
    case "mb":
      return {
        x: this.position.x,
        y: mousePosition.y,
      };
  }
}

function onDrag(this: TransformController) {
  if (this.isDragging) {
    const delta = {
      x:
        SceneHandler.currentScene!.mouseHandler.position.x -
        this.startDragPosition.x,
      y:
        SceneHandler.currentScene!.mouseHandler.position.y -
        this.startDragPosition.y,
    };

    const mousePosition = SceneHandler.currentScene!.mouseHandler.position;

    this.connectedEntity.size = getSize.bind(this)(delta);
    this.connectedEntity.position = getPosition.bind(this)(delta);
    this.position = getControllerPosition.bind(this)(mousePosition);

    this.startDragPosition = mousePosition;

    this.onUpdatePosition();
  }
}

function getCursorByType(type: ControllerType) {
  switch (type) {
    case "ml":
    case "mr":
      return "ew-resize";
    case "mt":
    case "mb":
      return "ns-resize";
  }
}

function onMouseDown(this: TransformController, callback?: () => void) {
  this.isDragging = true;
  this.startDragPosition = SceneHandler.currentScene!.mouseHandler.position;
  SceneHandler.currentScene?.canvas.addEventListener(
    "mousemove",
    onDrag.bind(this),
  );
  callback?.();
}

function onMouseUp(this: TransformController) {
  SceneHandler.currentScene?.canvas.removeEventListener(
    "mousemove",
    onDrag.bind(this),
  );
  this.isDragging = false;
}

function onMouseEnter(this: TransformController) {
  const scene = SceneHandler.currentScene;
  if (scene) {
    scene.canvas.style.cursor = getCursorByType(this.type);
  }
}

function onMouseLeave(this: TransformController) {
  const scene = SceneHandler.currentScene;
  if (scene) {
    scene.canvas.style.cursor = "default";
  }
}

function getControllerPositionBasedOnBounds(
  entity: { position: Vec2; size: Vec2 },
  type: ControllerType,
) {
  switch (type) {
    case "ml":
      return {
        x: entity.position.x - entity.size.x / 2,
        y: entity.position.y,
      };
    case "mt":
      return {
        x: entity.position.x,
        y: entity.position.y - entity.size.y / 2,
      };
    case "mb":
      return {
        x: entity.position.x,
        y: entity.position.y + entity.size.y / 2,
      };
    case "mr":
      return {
        x: entity.position.x + entity.size.x / 2,
        y: entity.position.y,
      };
  }
}

export const transformControllerUtils = {
  onDrag,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
  getControllerPositionBasedOnBounds,
};
