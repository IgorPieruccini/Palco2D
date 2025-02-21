import { Scene, SceneHandler } from "@palco-2d/core";

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

const dpr = window.devicePixelRatio;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

if (!canvas) {
  throw new Error("Canvas not found");
}

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Element is not a canvas");
}

const width = canvas.clientWidth;
const height = canvas.clientHeight;

canvas.setAttribute("width", (width * dpr).toString());

canvas.setAttribute("height", (height * dpr).toString());

const tileMap = new TileMapExample(canvas, "TileMap");
const sprite = new SpriteExample(canvas, "Sprite");
const objectEvents = new ObjectEventsExample(canvas, "ObjectEvent");
const layer = new LayersExample(canvas, "Layer");
const drag = new DragExample(canvas, "DragExample");
const batch = new BatchExample(canvas, "BatchExample");
const text = new TextExample(canvas, "TextExample");
const flippedSprite = new FlipSpriteExample(canvas, "Flip sprite");
const blendingMode = new BlendingModeExample(canvas, "Blending Mode");
const serialized = new SerializeExample(canvas, "Serialized");
const infinityCanvas = new InvitiyCanvasSceneExample(canvas, "InfinityCanvas");
const entityPluginExample = new EntityPluginExample(
  canvas,
  "EntityPluginExample",
);
const addRemoveEntity = new AddRemoveEntityExample(canvas, "AddRemoveEntity");
const quadrantsExample = new QuadrantExamples(canvas, "QuadrantsExample");

const scenes: Scene[] = [
  tileMap,
  sprite,
  objectEvents,
  layer,
  drag,
  batch,
  text,
  flippedSprite,
  blendingMode,
  serialized,
  infinityCanvas,
  entityPluginExample,
  addRemoveEntity,
  quadrantsExample,
];
const initialScene = "QuadrantsExample";

const sceneHandler = new SceneHandler(scenes);

const createSceneDropdown = () => {
  const select = document.getElementById("select-example") as HTMLSelectElement;

  if (!select) {
    throw new Error("Select element not found");
  }

  scenes.forEach((scene) => {
    const option = document.createElement("option");
    const sceneName = scene.getName();
    if (sceneName === initialScene) {
      option.selected = true;
    }
    option.value = sceneName;
    option.text = sceneName;
    select.appendChild(option);
  });

  select.addEventListener("change", (event) => {
    sceneHandler.setCurrentScene((event.target as HTMLSelectElement).value);
    select.blur();
    canvas.focus();
  });

  document.body.appendChild(select);
};

createSceneDropdown();
sceneHandler.startScene(initialScene);
