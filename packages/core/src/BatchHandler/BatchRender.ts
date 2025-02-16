import { BaseEntity } from "../BaseEntity";

export class BatchRender {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  entities: BaseEntity[];

  constructor(canvas: HTMLCanvasElement, entities: BaseEntity[]) {
    this.canvas = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not found');
    }
    this.ctx = ctx;


    const sortedLayers = entities.sort((a, b) => a.layer - b.layer);
    this.entities = sortedLayers;

    this.render.bind(this)();

    // Set the canvas to the correct size
    this.ctx.transform(
      1, // a
      0, // b
      0, // c  
      1, // d
      0, // e
      0 // f
    );
  }

  private renderLayers(entities: BaseEntity[]) {
    for (let x = 0; x < entities.length; x++) {
      const entity = entities[x];

      this.ctx.save();
      this.ctx.translate(entity.position.x, entity.position.y);
      this.ctx.rotate(entity.rotation * (Math.PI / 180));

      entity.render(this.ctx);

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

  private render() {
    const entitiesCopy = this.entities.slice();
    this.renderLayers.bind(this)(entitiesCopy);
  }

}
