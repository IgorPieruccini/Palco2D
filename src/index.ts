import { Scene } from './core/SceneHandler/Scene';
import { SceneHandler } from './core/SceneHandler/SceneHandler';
import { SceneExample } from './experiments/scene';
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

const scene = new SceneExample(canvas, "scenes");
const tileMap = new TileMapExample(canvas, "TileMap");

const scenes: Scene[] = [scene, tileMap];
const initialScene = "TileMap";

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

