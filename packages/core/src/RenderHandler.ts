import { BaseEntity } from "./BaseEntity";
import { FPSHandler } from "./FPSHandler";
import { ScenePlugin } from "./ScenePlugin";
import { Sprite } from "./Sprite";
import { WorldHandler } from "./WorldHandler";

const dpr = window.devicePixelRatio;
const MAX_LAYERS = 10;
const MAX_CHILDREN_LAYERS = 5;

export class RenderHandler {
  canvas: HTMLCanvasElement;
  upperCanvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  upperCtx: CanvasRenderingContext2D;
  public entities: Map<number, Map<string, BaseEntity>> = new Map();
  private fpsHandler = FPSHandler();
  private running = false;
  private paused: boolean = false;
  private plugins: Array<ScenePlugin> = [];

  constructor(
    canvas: HTMLCanvasElement,
    upperCanvas: HTMLCanvasElement,
    entities: BaseEntity[],
  ) {
    this.canvas = canvas;
    this.upperCanvas = upperCanvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not found");
    }
    this.ctx = ctx;

    const upperCtx = upperCanvas.getContext("2d");
    if (!upperCtx) {
      throw new Error("Upper canvas context not found");
    }
    this.upperCtx = upperCtx;

    const sortedLayers = entities.sort((a, b) => a.layer - b.layer);
    this.addEntities(sortedLayers);
  }

  private setIdentityMatrix() {
    this.ctx.transform(
      dpr, // a
      0, // b
      0, // c
      dpr, // d
      0, // e
      0, // f
    );

    this.upperCtx.transform(
      dpr, // a
      0, // b
      0, // c
      dpr, // d
      0, // e
      0, // f
    );
  }

  private setCanvasSize() {
    this.canvas.setAttribute("width", `${this.canvas.clientWidth * dpr}`);
    this.canvas.setAttribute("height", `${this.canvas.clientHeight * dpr}`);

    this.upperCanvas.setAttribute("width", `${this.canvas.clientWidth * dpr}`);
    this.upperCanvas.setAttribute(
      "height",
      `${this.canvas.clientHeight * dpr}`,
    );

    this.setIdentityMatrix();
  }

  public stopRender() {
    this.pauseRender();
    window.removeEventListener("resize", this.setCanvasSize.bind(this));
    this.entities.clear();
  }

  public pauseRender() {
    this.running = false;
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public startRender() {
    this.running = true;
    this.ctx.save();
    // Set the canvas to the correct size
    window.addEventListener("resize", this.setCanvasSize.bind(this));
    this.setCanvasSize();
    this.render.bind(this)();
  }

  public resumeRender() {
    this.paused = false;
    this.render();
  }

  // TODO: use binary search to find the correct position to insert the entity
  public addEntity(entity: BaseEntity) {
    let layer = this.entities.get(entity.layer);
    if (!layer) {
      layer = new Map();
      this.entities.set(entity.layer, layer);
    }
    layer.set(entity.id, entity);
  }

  public addEntities(entities: BaseEntity[]) {
    for (let x = 0; x < entities.length; x++) {
      const entity = entities[x];
      this.addEntity(entity);
    }
  }

  /**
   * Remove entity from scene
   * if the entity has children, they will be removed as well
   */
  public removeEntity(entity: BaseEntity) {
    const address = entity.getIdAddress();
    this.removeEntityByAddress(address);
  }

  /**
   * Get the instance of the entity by its id address
   */
  public getEntityByAddress(address: string): BaseEntity | undefined {
    const location = address.split("/");

    let currentEntity: BaseEntity | undefined = undefined;

    for (let i = location.length - 1; i >= 0; i--) {
      const [layer, id] = location[i].split(":");
      if (!currentEntity) {
        currentEntity = this.entities.get(parseInt(layer))?.get(id);
        continue;
      }

      currentEntity = currentEntity?.children.get(parseInt(layer))?.get(id);
    }

    return currentEntity;
  }

  /**
   * Find the entity by its id and remove it from the scene
   * if the entity has children, they will be removed as well
   */
  public removeEntityByAddress(address: string) {
    const location = address.split("/");

    const entity = this.getEntityByAddress(address);
    if (!entity) {
      throw new Error(`Entity with address ${address} not found`);
    }

    entity.destroy();

    if (location.length === 1) {
      const [layer, id] = location[0].split(":");
      this.entities.get(parseInt(layer))?.delete(id);
    }
  }

  private renderLayers(entities: Map<string, BaseEntity>) {
    const offset = WorldHandler.getOffset();
    const zoom = WorldHandler.getZoom();

    const layerIterator = entities.entries();
    let layerIteratorResult = layerIterator.next();

    while (!layerIteratorResult.done) {
      const [_, entity] = layerIteratorResult.value;

      const currentCtx = entity.isUI ? this.upperCtx : this.ctx;

      const viewportPosition = {
        x: -offset.x / zoom,
        y: -offset.y / zoom,
      };

      const viewportSize = {
        x: this.canvas.clientWidth / zoom,
        y: this.canvas.clientHeight / zoom,
      };

      const isInViewPort = entity.isObjectInViewport({
        position: viewportPosition,
        size: viewportSize,
      });

      currentCtx.save();

      if (!entity.parent) {
        const offset = WorldHandler.getOffset();
        currentCtx.translate(offset.x, offset.y);

        const zoom = WorldHandler.getZoom();
        currentCtx.scale(zoom, zoom);
      }

      currentCtx.save();
      const matrix = entity.matrix;
      currentCtx.transform(
        matrix[0][0], // a
        matrix[1][0], // b
        matrix[0][1], // c
        matrix[1][1], // d
        matrix[0][2], // e
        matrix[1][2], // f
      );

      if (isInViewPort && !entity.getStatic()) {
        entity.render(currentCtx);
        this.animateEntity(entity);
      }

      currentCtx.restore();

      const childrenIterator = entity.children.entries();
      let childrenIteratorResult = childrenIterator.next();

      while (!childrenIteratorResult.done) {
        currentCtx.save();
        const entityMatrix = entity.matrix;
        currentCtx.transform(
          entityMatrix[0][0], // a
          entityMatrix[1][0], // b
          entityMatrix[0][1], // c
          entityMatrix[1][1], // d
          entityMatrix[0][2], // e
          entityMatrix[1][2], // f
        );

        for (let i = 0; i < MAX_CHILDREN_LAYERS; i++) {
          const layer = entity.children.get(i);
          if (layer) {
            this.renderLayers(layer);
          }
        }

        currentCtx.restore();
        childrenIteratorResult = childrenIterator.next();
      }

      currentCtx.restore();
      layerIteratorResult = layerIterator.next();
    }
  }

  private renderPlugins() {
    this.upperCtx.save();
    const offset = WorldHandler.getOffset();
    this.upperCtx.translate(offset.x, offset.y);

    const zoom = WorldHandler.getZoom();
    this.upperCtx.scale(zoom, zoom);

    this.plugins.forEach((plugin) => {
      if (plugin.running) {
        plugin.render(this.upperCtx);
      }
    });

    this.upperCtx.restore();
  }

  //TODO: Create abstract class for entities that can be animated
  private animateEntity(sprite: BaseEntity) {
    if (sprite instanceof Sprite) {
      if (sprite.canBeAnimated()) {
        sprite.animate(this.fpsHandler.getDeltaTime());
      }
    }
  }

  private render() {
    if (this.paused) {
      return;
    }

    this.fpsHandler.loop();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.upperCtx.clearRect(
      0,
      0,
      this.upperCanvas.width,
      this.upperCanvas.height,
    );

    this.renderPlugins();

    for (let i = 0; i < MAX_LAYERS; i++) {
      const layer = this.entities.get(i);
      if (layer) {
        this.renderLayers(layer);
      }
    }

    requestAnimationFrame(this.render.bind(this));
  }

  public setPlugins(plugins: Array<ScenePlugin>) {
    this.plugins = plugins;
  }
}
