import { BaseEntity } from "./BaseEntity";
import { RenderHandler } from "./RenderHandler";

const dpr = window.devicePixelRatio;

export class BatchGraphicHandler {
  private batches: Record<string, (ctx: CanvasRenderingContext2D) => void> = {};

  private createCanvas() {
    const canvas = document.createElement("canvas");

    canvas.setAttribute(
      "width",
      (window.innerWidth * dpr).toString(),
    );

    canvas.setAttribute(
      "height",
      (window.innerHeight * dpr).toString(),
    );

    if (canvas === null) {
      throw new Error("Could not create canvas");
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx === null) {
      throw new Error("Could not get canvas context");
    }

    return { canvas, ctx };
  }

  batch(key: string, canvas: HTMLCanvasElement) {

    if (this.batches[key]) {
      return;
    }

    this.batches[key] = (ctx: CanvasRenderingContext2D) => {
      ctx.drawImage(canvas, 0, 0);
    };

  }

  /**
   * get a batched drawing by key
   */
  getBatch(key: string) {
    if (!this.batches[key]) {
      throw new Error(`No batched drawing found for ${key}`);
    }
    return this.batches[key];
  }

  getAllStaticBatches() {
    const staticBatches = Object.keys(this.batches).filter((key) => key.startsWith('STATIC'));
    const sortedByLayer = staticBatches.sort((a, b) => parseInt(a.replace('STATIC', '')) - parseInt(b.replace('STATIC', '')));
    return sortedByLayer.map((key) => this.batches[key]);
  }

  batchStaticObjects(entities: BaseEntity[]) {
    const staticEntities = entities.filter((entity) => entity.static);

    // Group all static entities in a batch divided by layers
    const staticLayers: Record<number, BaseEntity[]> = staticEntities.reduce((acc, entity) => {
      const layer = entity.layer || 0;
      if (!acc[layer]) {
        acc[layer] = [];
      }
      acc[layer].push(entity);
      return acc;
    }, {} as Record<number, BaseEntity[]>);

    Object.keys(staticLayers).forEach((layer) => {
      const { canvas, ctx } = this.createCanvas();
      const layerEntities = staticLayers[parseInt(layer)];
      new RenderHandler(ctx, layerEntities);
      this.batch('STATIC' + layer, canvas);
    });


  }

}

