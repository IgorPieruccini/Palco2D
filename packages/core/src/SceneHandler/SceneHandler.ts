import { Scene } from "./Scene";

/**
 * Responsible for scene management, providing the capability to start, pause, and stop scenes,
 * as well as seamlessly switch between them while maintaining a reference to the currently active scene.
 */
export class SceneHandler {
  /**
   * @property scenes
   * All the scenes added to the handler.
   **/
  private scenes: Map<string, Scene> = new Map();

  /**
   * Current running scene.
   */
  public static currentScene: Scene;

  /**
   * The HTML canvas element the scenes render to.
   */
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

  /**
   * Stops the current scene and starts the scene with the given name.
   * @param name - The name of the scene to start.
   */
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

  /**
   * Adds a scene to the handler so later it can be referenced by its name.
   */
  public addScene<T extends Scene>(scene: T, name: string) {
    this.scenes.set(name, scene);
  }

  /**
   * Returns the scene with the given name.
   * @param name - The name of the scene to get.
   * @returns The Scene with the given name.
   */
  public getScene(name: string) {
    return this.scenes.get(name);
  }

  /**
   * Starts the scene with the given name.
   * @param name - The name of the scene to start.
   */
  public startScene(name: string) {
    const scene = this.getScene(name);
    if (!scene) {
      throw new Error(`Scene ${name} not found`);
    }
    SceneHandler.currentScene = scene;
    scene.start();
  }

  /**
   * Stop the scene with the given name.
   * @param name - The name of the scene to stop.
   */
  public stopScene(name: string) {
    const scene = this.getScene(name);
    if (!scene) {
      throw new Error(`Scene ${name} not found`);
    }
    scene.stop();
  }

  /**
   * Get all the scene names added to the handler.
   * @returns An array with all the scene names.
   */
  public getSceneNames() {
    return Array.from(this.scenes.keys());
  }
}
