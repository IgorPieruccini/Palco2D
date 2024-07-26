import { Scene } from './core/SceneHandler/Scene';
import { SceneHandler } from './core/SceneHandler/SceneHandler';
import { BatchExample } from './experiments/batch-example';
import { DragExample } from './experiments/drag-example';
import { LayersExample } from './experiments/layers';
import { ObjectEventsExample } from './experiments/object-events';
import { SpriteExample } from './experiments/sprite';
import { TextExample } from './experiments/text-example';
import { TileMapExample } from './experiments/tile-map';


const dpr = window.devicePixelRatio;

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;

if (!canvas) {
  throw new Error('Canvas not found');
}

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Element is not a canvas');
}

const width = canvas.clientWidth;
const height = canvas.clientHeight;

canvas.setAttribute(
  "width",
  (width * dpr).toString(),
);

canvas.setAttribute(
  "height",
  (height * dpr).toString(),
);

const tileMap = new TileMapExample(canvas, "TileMap");
const sprite = new SpriteExample(canvas, "Sprite");
const objectEvents = new ObjectEventsExample(canvas, "ObjectEvent");
const layer = new LayersExample(canvas, "Layer");
const drag = new DragExample(canvas, "DragExample");
const batch = new BatchExample(canvas, "BatchExample");
const text = new TextExample(canvas, "TextExample");

const scenes: Scene[] = [tileMap, sprite, objectEvents, layer, drag, batch, text];
const initialScene = "TextExample";

const sceneHandler = new SceneHandler(scenes);

const createSceneDropdown = () => {
  const select = document.getElementById('select-example') as HTMLSelectElement;

  if (!select) {
    throw new Error('Select element not found');
  }

  scenes.forEach((scene) => {
    const option = document.createElement('option');
    const sceneName = scene.getName();
    if (sceneName === initialScene) {
      option.selected = true
    }
    option.value = sceneName;
    option.text = sceneName;
    select.appendChild(option);
  });

  select.addEventListener('change', (event) => {
    sceneHandler.setCurrentScene((event.target as HTMLSelectElement).value);
  });

  document.body.appendChild(select);
}

createSceneDropdown();
sceneHandler.startScene(initialScene);

