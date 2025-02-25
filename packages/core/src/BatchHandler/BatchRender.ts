import { BaseEntity } from "../BaseEntity";

export class BatchRender {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  entities: Map<string, BaseEntity> = new Map();

  constructor(canvas: HTMLCanvasElement, entities: BaseEntity[]) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context not found");
    }
    this.ctx = ctx;

    const sortedLayers = entities.sort((a, b) => a.layer - b.layer);
    for (const entity of sortedLayers) {
      this.entities.set(entity.id, entity);
    }

    this.render();

    // Set the canvas to the correct size
    this.ctx.transform(
      1, // a
      0, // b
      0, // c
      1, // d
      0, // e
      0, // f
    );
  }

  private renderLayers(entities: Map<string, BaseEntity>) {
    const iterator = entities.entries();
    let iteratorResult = iterator.next();

    while (!iteratorResult.done) {
      const [_, entity] = iteratorResult.value;

      this.ctx.save();
      this.ctx.translate(entity.position.x, entity.position.y);
      this.ctx.rotate(entity.rotation * (Math.PI / 180));

      entity.render(this.ctx);

      this.ctx.restore();

      const childrenIterator = entity.children.entries();
      let childrenIteratorResult = childrenIterator.next();

      while (!childrenIteratorResult.done) {
        this.ctx.save();
        const scale = entity.getScale();

        // apply translation matrix
        this.ctx.transform(
          scale.x, // a
          0, // b
          0, // c
          scale.y, // d
          entity.position.x, // e
          entity.position.y, // f
        );

        const rad = entity.rotation * (Math.PI / 180);

        // apply rotation matrix
        this.ctx.transform(
          Math.cos(rad), // a
          Math.sin(rad), // b
          -Math.sin(rad), // c
          Math.cos(rad), // d
          1,
          1,
        );

        for (let i = 0; i < 5; i++) {
          const layer = entity.children.get(i);
          if (layer) {
            this.renderLayers(layer);
          }
        }

        this.ctx.restore();
        childrenIteratorResult = childrenIterator.next();
      }
      iteratorResult = iterator.next();
    }
  }

  private render() {
    this.renderLayers(this.entities);
  }
}
