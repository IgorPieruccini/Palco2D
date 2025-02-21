import { BaseEntity } from "./BaseEntity";
import { FPSHandler } from "./FPSHandler";
import { ScenePlugin } from "./ScenePlugin";
import { Sprite } from "./Sprite";
import { WorldHandler } from "./WorldHandler";
import {
  getMatrixPosition,
  getMatrixRotation,
  getMatrixScale,
  multiplyMatrices,
} from "./utils";

const dpr = window.devicePixelRatio;

export class RenderHandler {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  entities: BaseEntity[];
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
    this.entities = sortedLayers;
  }

  public stopRender() {
    this.running = false;
    this.entities = [];
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
    const entities = [...this.entities, entity];
    this.entities = entities.sort((a, b) => a.layer - b.layer);
  }

  public addEntities(entities: BaseEntity[]) {
    const concatedEntities = [...this.entities, ...entities];
    this.entities = concatedEntities.sort((a, b) => a.layer - b.layer);
  }

  public removeEntity(entity: BaseEntity, shiftIndex?: number) {
    let index = entity.getRenderIndex();

    if (index === null) return;

    if (shiftIndex) {
      index -= shiftIndex;
    }

    if (entity.parent) {
      entity.parent.removeChild(index);
      return;
    }

    this.entities.splice(index, 1);
  }

  public removeEntities(entities: BaseEntity[]) {
    let removedIndex = 0;

    for (let x = 0; x < entities.length; x++) {
      this.removeEntity(entities[x], removedIndex);
      removedIndex++;
    }
  }

  private renderLayers(entities: BaseEntity[]) {
    const offset = WorldHandler().getOffset();
    const zoom = WorldHandler().getZoom();

    for (let x = 0; x < entities.length; x++) {
      const entity = entities[x];

      entity.setRenderIndex(x);

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

      if (entity.children.length > 0) {
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

        this.renderLayers(entity.children.slice());
        this.ctx.restore();
      }

      this.ctx.restore();
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
    const entitiesCopy = this.entities.slice();
    this.renderLayers.bind(this)(entitiesCopy);

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
