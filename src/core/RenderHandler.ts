import { BaseEntity } from "./BaseEntity";
import { FPSHandler } from "./FPSHandler";
import { Sprite } from "./Sprite";

const dpr = window.devicePixelRatio;

export class RenderHandler {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  entities: BaseEntity[];
  private fpsHandler = FPSHandler();
  private running = false;

  constructor(canvas: HTMLCanvasElement, entities: BaseEntity[]) {
    this.canvas = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not found');
    }
    this.ctx = ctx;


    const sortedLayers = entities.sort((a, b) => a.layer - b.layer);
    this.entities = sortedLayers;

    // Set the canvas to the correct size
    this.ctx.transform(
      dpr, // a
      0, // b
      0, // c  
      dpr, // d
      0, // e
      0 // f
    );
  }

  public stopRender() {
    this.running = false;
    console.log("on stop render", this.entities.length);
    this.entities = [];
    console.log("stop render", this.entities);
    this.ctx.clearRect(0, 0, this.canvas.clientWidth * dpr, this.canvas.clientHeight * dpr);
  }

  public startRender() {
    this.running = true;
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
        size: { x: this.canvas.width, y: this.canvas.height }
      });

      this.ctx.save();
      this.ctx.translate(entity.position.x, entity.position.y);
      this.ctx.rotate(entity.rotation * (Math.PI / 180));

      if (isInViewPort && !entity.static) {
        entity.render(this.ctx);
        this.animateEntity(entity)
      }

      this.ctx.restore();

      if (entity.children.length > 0) {
        this.ctx.save();
        const scale = entity.getScale();

        // apply translation matrix
        this.ctx.transform(
          scale.x, // a
          0, // b
          0, // c  
          scale.y, // d
          entity.position.x, // e
          entity.position.y // f
        );

        const rad = entity.rotation * (Math.PI / 180);

        // apply rotation matrix
        this.ctx.transform(
          Math.cos(rad), // a
          Math.sin(rad), // b
          -Math.sin(rad), // c  
          Math.cos(rad), // d
          1,
          1
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
    this.ctx.clearRect(0, 0, window.innerWidth * dpr, window.innerHeight * dpr);
    const entitiesCopy = this.entities.slice();
    this.renderLayers.bind(this)(entitiesCopy);

    if (this.running) {
      requestAnimationFrame(this.render.bind(this));
    }
  }

}
