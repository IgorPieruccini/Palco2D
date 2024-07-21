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
const currentSceneName: SceneKeyType = 'BatchExample';

const dpr = window.devicePixelRatio;

export const canvas = document.getElementById('canvas');

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

scenes[currentSceneName](canvas);
