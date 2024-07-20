import { BaseEntity } from "./BaseEntity";
import { RenderHandler } from "./RenderHandler";

const dpr = window.devicePixelRatio;

type BatchType = {
  draw: (ctx: CanvasRenderingContext2D) => void;
  layer: number;
}

export class BatchGraphicHandler {
  private batches: Record<string, BatchType> = {};

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

    return canvas;
  }

  batch(key: string, canvas: HTMLCanvasElement, layer: number) {

    if (this.batches[key]) {
      return;
    }

    this.batches[key] = {
      draw: (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(canvas, 0, 0);
      },
      layer
    }
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
      const canvas = this.createCanvas();
      const layerInt = parseInt(layer);
      const layerEntities = staticLayers[layerInt];
      new RenderHandler(canvas, layerEntities, 1);
      this.batch('STATIC' + layer, canvas, layerInt);
    });
  }

}

