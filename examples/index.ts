import { SceneHandler } from "@palco-2d/core";

// Import examples
import { BatchExample } from "./src/batch-example";
import { BlendingModeExample } from "./src/blending-mode";
import { DragExample } from "./src/drag-example";
import { FlipSpriteExample } from "./src/fip-sprite";
import { LayersExample } from "./src/layers";
import { ObjectEventsExample } from "./src/object-events";
import { SerializeExample } from "./src/serialize";
import { SpriteExample } from "./src/sprite";
import { TextExample } from "./src/text-example";
import { TileMapExample } from "./src/tile-map";
import { InvitiyCanvasSceneExample } from "./src/infinityCanvas";
import { PluginsExample } from "./src/plugins-example";
import { AddRemoveEntityExample } from "./src/add-remove-entity";
import { QuadrantExamples } from "./src/quadrants-example";
import { SvgImageScene } from "./src/svgImage";
import { MaskExample } from "./src/mask-example";

const sceneHandler = new SceneHandler();

sceneHandler.addScene(TileMapExample, "TileMap");
sceneHandler.addScene(SpriteExample, "SpriteExample");
sceneHandler.addScene(ObjectEventsExample, "ObjectEventsExample");
sceneHandler.addScene(LayersExample, "LayersExample");
sceneHandler.addScene(DragExample, "DragExample");
sceneHandler.addScene(BatchExample, "BatchExample");
sceneHandler.addScene(TextExample, "TextExample");
sceneHandler.addScene(FlipSpriteExample, "FlipSpriteExample");
sceneHandler.addScene(BlendingModeExample, "BlendingModeExample");
sceneHandler.addScene(SerializeExample, "SerializeExample");
sceneHandler.addScene(InvitiyCanvasSceneExample, "InfinityCanvas");
sceneHandler.addScene(PluginsExample, "PluginsExample");
sceneHandler.addScene(AddRemoveEntityExample, "AddRemoveEntity");
sceneHandler.addScene(QuadrantExamples, "QuadrantsExample");
sceneHandler.addScene(SvgImageScene, "SvgImage");
sceneHandler.addScene(MaskExample, "MaskExample");

const initialScene = "MaskExample";

const createSceneDropdown = () => {
  const select = document.getElementById("select-example") as HTMLSelectElement;

  if (!select) {
    throw Error("Select element not found");
  }

  sceneHandler.getSceneNames().forEach((name) => {
    const option = document.createElement("option");
    if (name === initialScene) {
      option.selected = true;
    }
    option.value = name;
    option.text = name;
    select.appendChild(option);
  });

  select.addEventListener("change", (event) => {
    sceneHandler.setCurrentScene((event.target as HTMLSelectElement).value);
    select.blur();
  });

  document.body.appendChild(select);
};

createSceneDropdown();
sceneHandler.startScene(initialScene);
