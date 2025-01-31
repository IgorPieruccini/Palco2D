import { BaseEntity } from "./BaseEntity";
import { FPSHandler } from "./FPSHandler";
import { Sprite } from "./Sprite";
import { Vec2 } from "./types";
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
  public offset: Vec2 = { x: 0, y: 0 };
  public zoom = 1;

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

  public addEntity(entity: BaseEntity) {
    const entities = [...this.entities, entity];
    this.entities = entities.sort((a, b) => a.layer - b.layer);
  }

  public addEntities(entities: BaseEntity[]) {
    const concatedEntities = [...this.entities, ...entities];
    this.entities = concatedEntities.sort((a, b) => a.layer - b.layer);
  }

  private renderLayers(entities: BaseEntity[]) {
    for (let x = 0; x < entities.length; x++) {
      const entity = entities[x];

      const isInViewPort = entity.isObjectInViewport({
        position: { x: 0, y: 0 },
        size: { x: this.canvas.clientWidth, y: this.canvas.clientHeight },
      });

      this.ctx.save();

      this.ctx.translate(this.offset.x, this.offset.y);
      this.ctx.scale(this.zoom, this.zoom);

      this.ctx.translate(entity.position.x, entity.position.y);
      this.ctx.rotate(entity.rotation * (Math.PI / 180));

      if (isInViewPort && !entity.static) {
        entity.render(this.ctx);
        this.animateEntity(entity);
      }

      this.ctx.restore();

      if (entity.children.length > 0) {
        this.ctx.save();
        const scale = entity.getScale();
        const rad = entity.rotation * (Math.PI / 180);

        const positionM = getMatrixPosition(
          entity.position.x,
          entity.position.y,
        );
        const rotationM = getMatrixRotation(rad);
        const scaleM = getMatrixScale(scale.x, scale.y);

        const multipliedMatrix = multiplyMatrices(
          multiplyMatrices(positionM, rotationM),
          scaleM,
        );

        this.ctx.transform(
          multipliedMatrix[0][0], // a
          multipliedMatrix[1][0], // b
          multipliedMatrix[0][1], // c
          multipliedMatrix[1][1], // d
          multipliedMatrix[0][2], // e
          multipliedMatrix[1][2], // f
        );

        this.renderLayers(entity.children.slice());
        this.ctx.restore();
      }
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
      requestAnimationFrame(this.render.bind(this));
    }
  }
}
