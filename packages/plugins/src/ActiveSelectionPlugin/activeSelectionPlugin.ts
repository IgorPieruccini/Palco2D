import { BaseEntity, Scene, ScenePlugin } from "@palco-2d/core";
import { BoundingBoxEntity } from "../BoundingBoxEntity";

export class ActiveSelectionPlugin extends ScenePlugin {
  selectedEntities: Map<string, BaseEntity> = new Map();

  init() {
    this.scene.eventHandler.subscribeToAddEntity((entity) => {
      entity.on("mouseup", () => {
        this.clearSelection();
        this.selectedEntities.set(entity.id, entity);
        entity.addPlugin(BoundingBoxEntity, "boundingBox");
      });
    });

    this.scene.mouseHandler.onCanvas("mouseup", () => {
      this.clearSelection();
      this.selectedEntities.clear();
    });
  }

  clearSelection() {
    this.selectedEntities.forEach((entity) => {
      entity.removePluginByKey("boundingBox");
    });
    this.selectedEntities.clear();
  }
}
