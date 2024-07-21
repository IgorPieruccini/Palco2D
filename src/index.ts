import SimpleDrawing from './experiments/simple-drawing';
import Layers from './experiments/layers';
import ObjectEvents from './experiments/object-events';
import DragExample from './experiments/drag-example';
import Sprite from './experiments/sprite';
import TileMap from './experiments/tile-map';
import BatchExample from './experiments/batch-example';

const scenes = {
  SimpleDrawing,
  Layers,
  ObjectEvents,
  DragExample,
  Sprite,
  TileMap,
  BatchExample,
}

type SceneKeyType = keyof typeof scenes;
const initialScene: SceneKeyType = "TileMap";

const dpr = window.devicePixelRatio;

export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
console.log(canvas)

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

const createSceneDropdown = () => {
  const select = document.getElementById('select-example') as HTMLSelectElement;

  if (!select) {
    throw new Error('Select element not found');
  }

  Object.keys(scenes).forEach((sceneName) => {
    const option = document.createElement('option');
    if (sceneName === initialScene) {
      option.selected = true
    }
    option.value = sceneName;
    option.text = sceneName;
    select.appendChild(option);
  });

  select.addEventListener('change', (event) => {
    const sceneName = (event.target as HTMLSelectElement).value as SceneKeyType;
    scenes[sceneName](canvas);
  });

  document.body.appendChild(select);
}

createSceneDropdown();
scenes[initialScene](canvas);
