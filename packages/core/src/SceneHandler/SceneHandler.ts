import { Scene } from "./Scene";

export class SceneHandler {
  private scenes: Map<string, Scene> = new Map();
  public static currentScene: Scene;
  public static canvas: HTMLCanvasElement;

  constructor() {
    const canvas = document.getElementById(
      "palco-2d-canvas",
    ) as HTMLCanvasElement;

    if (!canvas) {
      throw new Error(
        "Could not find 'palco-2d-canvas': Make sure to have a canvas element with the id 'palco-2d-canvas'",
      );
    }

    SceneHandler.canvas = canvas;
  }

  public setCurrentScene(name: string) {
    const scene = this.getScene(name);

    if (!scene) {
      throw new Error(`Scene ${name} not found`);
    }

    if (SceneHandler.currentScene) {
      SceneHandler.currentScene.stop();
      SceneHandler.currentScene = scene;
      SceneHandler.currentScene.start();
      SceneHandler.canvas.focus();
    }
  }

  public static getCurrentScene() {
    return this.currentScene;
  }

  public addScene<T extends Scene>(scene: T, name: string) {
    this.scenes.set(name, scene);
  }

  public getScene(name: string) {
    return this.scenes.get(name);
  }

  public startScene(name: string) {
    const scene = this.getScene(name);
    if (!scene) {
      throw new Error(`Scene ${name} not found`);
    }
    SceneHandler.currentScene = scene;
    scene.start();
  }

  public stopScene(name: string) {
    const scene = this.getScene(name);
    if (!scene) {
      throw new Error(`Scene ${name} not found`);
    }
    scene.stop();
  }

  public getSceneNames() {
    return Array.from(this.scenes.keys());
  }
}
