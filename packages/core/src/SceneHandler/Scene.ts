import { MouseHandler } from "../MouseHandler";
import { ScenePlugin } from "../ScenePlugin";
import { RenderHandler } from "../RenderHandler";
import { WorldHandler } from "../WorldHandler";
import { SceneHandler } from "./SceneHandler";

export class Scene {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public render: RenderHandler;
  public mouseHandler: MouseHandler;
  public world: ReturnType<typeof WorldHandler> = WorldHandler();
  private plugins: Record<string, ScenePlugin> = {};

  constructor() {
    this.canvas = SceneHandler.canvas;

    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not found");
    }

    this.ctx = ctx;
    this.render = new RenderHandler(this.canvas, []);
    this.mouseHandler = new MouseHandler(this.canvas);
  }

  public async start() { }

  public stop() {
    this.mouseHandler.stop();
    this.render.stopRender();

    for (const plugin of Object.values(this.plugins)) {
      plugin.stop();
    }

    this.plugins = {};
    this.render.setPlugins([]);
  }

  public pause() {
    this.mouseHandler.puase();
    this.render.pauseRender();

    for (const plugin of Object.values(this.plugins)) {
      plugin.stop();
    }

    this.plugins = {};
    this.render.setPlugins([]);
  }

  public addPlugin(plugin: ScenePlugin, key: string) {
    if (this.plugins[key]) {
      throw new Error(`Plugin with key ${key} already exists`);
    }
    this.plugins[key] = plugin;
    this.render.setPlugins(Object.values(this.plugins));
  }

  public removePlugin(key: string) {
    if (!this.plugins[key]) {
      throw new Error(`Plugin with key ${key} does not exist`);
    }
    delete this.plugins[key];
    this.render.setPlugins(Object.values(this.plugins));
  }

  public getPlugin(key: string) {
    return this.plugins[key];
  }

  public startAllPlugins() {
    Object.values(this.plugins).forEach((plugin) => {
      plugin.start();
    });
  }

  public stopAllPlugins() {
    Object.values(this.plugins).forEach((plugin) => {
      plugin.stop();
    });
  }

  public startSomePlugins(keys: string[]) {
    keys.forEach((key) => {
      this.plugins[key].start();
    });
  }

  public stopSomePlugins(keys: string[]) {
    keys.forEach((key) => {
      this.plugins[key].stop();
    });
  }
}
