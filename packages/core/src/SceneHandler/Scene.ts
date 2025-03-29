import { MouseHandler } from "../MouseHandler";
import { ScenePlugin } from "../ScenePlugin";
import { RenderHandler } from "../RenderHandler";
import { SceneHandler } from "./SceneHandler";
import { WorldHandler } from "../WorldHandler";

/**
 *The Scene class serves as the core component of Palco 2D, providing the foundation for creating and managing 2D scenes.
 * It integrates a renderer and mouse handler to enable visual rendering and interactive functionality,
 * along with additional abstractions
 */
export class Scene {
  /**
   * The HTML canvas element the scene renders to.
   */
  public canvas: HTMLCanvasElement;

  /**
   * The HTML canvas element the scene used by scene plugins.
   * to render on top of the main canvas, without interfering with the main canvas.
   */
  public upperCanvas: HTMLCanvasElement;

  /**
   * The 2D rendering context of the canvas.
   */
  public ctx: CanvasRenderingContext2D;
  /**
   * The rendering handler for the scene.
   * Responsible for rendering entities and plugins to the canvas.
   */
  public render: RenderHandler;
  /**
   * Handles mouse interactions within the scene,
   * detecting when the cursor hovers over an entity and dispatching relevant mouse events to subscribed entities.
   */
  public mouseHandler: MouseHandler;
  /**
   * A record of all the plugins added to the scene.
   * Plugins are used to add custom functionality to the scene.
   */
  private plugins: Record<string, ScenePlugin> = {};

  constructor() {
    this.canvas = SceneHandler.canvas;
    this.upperCanvas = SceneHandler.upperCanvas;

    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not found");
    }

    this.ctx = ctx;
    this.render = new RenderHandler(this.canvas, this.upperCanvas, []);
    this.mouseHandler = new MouseHandler(this.canvas);
  }

  /**
   * Starts the custom scene logic, here you the code you create will be triggered,
   * It's the perfect place to create all the entities and plugins you need and add them
   * to the scene.
   */
  public async start() { }

  /**
   * Stops render and mouse handler from running.
   * It also stops all the plugins added to the scene.
   * When creating you custom scene, for best practices, you should call this method
   *  `super.stop()` before adding your custom logic, to ensure that the scene is properly stopped.
   *  it's the perfect place to remove any window listeners or clear any intervals that you might have created.
   */
  public stop() {
    this.mouseHandler.stop();
    this.render.stopRender();

    for (const plugin of Object.values(this.plugins)) {
      plugin.stop();
    }

    this.plugins = {};
    this.render.setPlugins([]);
  }

  /**
   * Pauses the render and mouse handler, without terminating the scene instance or entities.
   * Stops rendering and calculating any interatction but keep the scene and entities alive, so
   * on start, a re-creation of the scene is not needed.
   */
  public pause() {
    this.mouseHandler.pause();
    this.render.pauseRender();
    // SHOULD STOP ALL PLUGINS?
  }

  /**
   * add the plugin to the scene, to run the custom logic of the plugin, the plugin must be started.
   * @param plugin - The plugin to add to the scene.
   */
  public addPlugin(Plugin: typeof ScenePlugin, key: string) {
    const plug = new Plugin(this);

    if (this.plugins[key]) {
      throw new Error(`Plugin with key ${key} already exists`);
    }
    this.plugins[key] = plug;
    this.render.setPlugins(Object.values(this.plugins));
  }

  /**
   * Removes the plugin from the scene.
   * @param key - The key of the plugin to remove.
   * on removing, the custom logic of the plugin will be stopped.
   */
  public removePlugin(key: string) {
    if (!this.plugins[key]) {
      throw new Error(`Plugin with key ${key} does not exist`);
    }
    this.plugins[key].stop();
    delete this.plugins[key];
    this.render.setPlugins(Object.values(this.plugins));
    WorldHandler.setZoom(1);
    WorldHandler.setOffset({ x: 0, y: 0 });
  }

  /**
   * Returns the plugin with the given key.
   * @param key - The key of the plugin to retrieve.
   */
  public getPlugin(key: string) {
    return this.plugins[key];
  }

  /**
   * Starts the plugins added to the scene.
   * All Scene plugins start method will be called.
   */
  public startAllPlugins() {
    Object.values(this.plugins).forEach((plugin) => {
      plugin.start();
    });
  }
}
