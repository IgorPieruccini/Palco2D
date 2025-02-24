import { BaseEntity } from "../BaseEntity";
import { MouseHandler } from "../MouseHandler";
import { ScenePlugin } from "../ScenePlugin";
import { RenderHandler } from "../RenderHandler";
import { WorldHandler } from "../WorldHandler";

export class Scene {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public render: RenderHandler;
  public mouseHandler: MouseHandler;
  public world: ReturnType<typeof WorldHandler> = WorldHandler();
  private name: string;
  private plugins: Record<string, ScenePlugin> = {};

  constructor(canvas: HTMLCanvasElement, name: string) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not found");
    }

    this.ctx = ctx;
    this.name = name;
    this.render = new RenderHandler(canvas, []);
    this.mouseHandler = new MouseHandler(canvas, []);
  }

  public getName() {
    return this.name;
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

  // TODO: implement
  public getEntityByAddress(address: string): BaseEntity | undefined {
    const ids = address.split("/");
    let entity = this.render.entities.get(ids[ids.length - 1]);
    if (!entity) {
      throw new Error(`Entity with id ${ids[ids.length - 1]} not found`);
    }

    for (let i = ids.length - 2; i >= 0; i--) {
      entity = entity.children.get(ids[i]);
      if (!entity) {
        throw new Error(`Entity with id ${ids[i]} not found`);
      }
    }
    return entity;
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
