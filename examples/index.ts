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
import { EntityPluginExample } from "./src/enityPluginExample";
import { AddRemoveEntityExample } from "./src/add-remove-entity";
import { QuadrantExamples } from "./src/quadrants-example";
import { SvgImageScene } from "./src/svgImage";

const sceneHandler = new SceneHandler();

sceneHandler.addScene(new TileMapExample(), "TileMap");
sceneHandler.addScene(new SpriteExample(), "SpriteExample");
sceneHandler.addScene(new ObjectEventsExample(), "ObjectEventsExample");
sceneHandler.addScene(new LayersExample(), "LayersExample");
sceneHandler.addScene(new DragExample(), "DragExample");
sceneHandler.addScene(new BatchExample(), "BatchExample");
sceneHandler.addScene(new TextExample(), "TextExample");
sceneHandler.addScene(new FlipSpriteExample(), "FlipSpriteExample");
sceneHandler.addScene(new BlendingModeExample(), "BlendingModeExample");
sceneHandler.addScene(new SerializeExample(), "SerializeExample");
sceneHandler.addScene(new InvitiyCanvasSceneExample(), "InfinityCanvas");
sceneHandler.addScene(new EntityPluginExample(), "EntityPluginExample");
sceneHandler.addScene(new AddRemoveEntityExample(), "AddRemoveEntity");
sceneHandler.addScene(new QuadrantExamples(), "QuadrantsExample");
sceneHandler.addScene(new SvgImageScene(), "SvgImage");

const initialScene = "SvgImage";

const createSceneDropdown = () => {
  const select = document.getElementById("select-example") as HTMLSelectElement;

  if (!select) {
    throw new Error("Select element not found");
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
