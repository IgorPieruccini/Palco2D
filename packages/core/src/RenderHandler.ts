import { BaseEntity } from "./BaseEntity";
import { FPSHandler } from "./FPSHandler";
import { ScenePlugin } from "./ScenePlugin";
import { Sprite } from "./Sprite";
import { WorldHandler } from "./WorldHandler";

const dpr = window.devicePixelRatio;

export class RenderHandler {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  entities: Map<string, BaseEntity> = new Map();
  private fpsHandler = FPSHandler();
  private running = false;
  private paused: boolean = false;
  private plugins: Array<ScenePlugin> = [];

  constructor(canvas: HTMLCanvasElement, entities: BaseEntity[]) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not found");
    }
    this.ctx = ctx;

    const sortedLayers = entities.sort((a, b) => a.layer - b.layer);
    this.addEntities(sortedLayers);
  }

  public stopRender() {
    this.running = false;
    this.ctx.restore();
    this.ctx.clearRect(
      0,
      0,
      this.canvas.clientWidth * dpr,
      this.canvas.clientHeight * dpr,
    );
  }

  public startRender() {
    this.running = true;
    this.ctx.save();
    // Set the canvas to the correct size
    this.ctx.transform(
      dpr, // a
      0, // b
      0, // c
      dpr, // d
      0, // e
      0, // f
    );
    this.render.bind(this)();
  }

  public pauseRender() {
    this.paused = true;
  }

  public resumeRender() {
    this.paused = false;
    this.render();
  }

  public addEntity(entity: BaseEntity) {
    this.entities.set(entity.id, entity);
  }

  public addEntities(entities: BaseEntity[]) {
    for (let x = 0; x < entities.length; x++) {
      this.entities.set(entities[x].id, entities[x]);
    }
  }

  public removeEntity(entity: BaseEntity) {
    this.entities.delete(entity.id);
  }

  public removeEntities(entities: BaseEntity[]) {
    for (let x = 0; x < entities.length; x++) {
      this.entities.delete(entities[x].id);
    }
  }

  private renderLayers(entities: Map<string, BaseEntity>) {
    const offset = WorldHandler().getOffset();
    const zoom = WorldHandler().getZoom();

    const iterator = entities.entries();
    let iteratorResult = iterator.next();

    while (!iteratorResult.done) {
      const [_, entity] = iteratorResult.value;

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

      this.ctx.save();

      if (!entity.parent) {
        const offset = WorldHandler().getOffset();
        this.ctx.translate(offset.x, offset.y);

        const zoom = WorldHandler().getZoom();
        this.ctx.scale(zoom, zoom);
      }

      this.ctx.save();
      this.ctx.translate(entity.position.x, entity.position.y);
      this.ctx.rotate(entity.rotation * (Math.PI / 180));

      if (isInViewPort && !entity.static) {
        entity.render(this.ctx);
        this.animateEntity(entity);
      }

      this.ctx.restore();

      const childrenIterator = entity.children.entries();
      let childrenIteratorResult = childrenIterator.next();

      while (!childrenIteratorResult.done) {
        this.ctx.save();
        const entityMatrix = entity.getMatrix();
        this.ctx.transform(
          entityMatrix[0][0], // a
          entityMatrix[1][0], // b
          entityMatrix[0][1], // c
          entityMatrix[1][1], // d
          entityMatrix[0][2], // e
          entityMatrix[1][2], // f
        );

        this.renderLayers(entity.children);

        this.ctx.restore();
        childrenIteratorResult = childrenIterator.next();
      }

      this.ctx.restore();
      iteratorResult = iterator.next();
    }
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
    this.ctx.clearRect(
      0,
      0,
      this.canvas.clientWidth * dpr,
      this.canvas.clientHeight * dpr,
    );

    this.renderLayers(this.entities);

    if (this.running) {
      this.plugins.forEach((plugin) => {
        if (plugin.running) {
          plugin.render(this.ctx);
        }
      });

      requestAnimationFrame(this.render.bind(this));
    }
  }

  public setPlugins(plugins: Array<ScenePlugin>) {
    this.plugins = plugins;
  }
}
