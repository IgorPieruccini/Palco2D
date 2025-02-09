import { Scene } from "./Scene";

export class SceneHandler {
  private scenes: Scene[] = [];
  public static currentScene: Scene | null = null;

  constructor(scenes: Scene[]) {
    this.scenes = scenes;
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
    }
  }

  public static getCurrentScene() {
    return this.currentScene;
  }

  public addScene(scene: Scene) {
    this.scenes.push(scene);
  }

  public getScene(name: string) {
    return this.scenes.find((scene) => scene.getName() === name);
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
}
