import { CachedSVGAsset, SVGData, SVGImageProps, Vec2 } from "../../types";
import { AssetHandler } from "../AssetHandler";
import { BaseEntity } from "../BaseEntity";
import { Path2DEntity } from "./Path2DEntity";

export class SVGImageEntity extends BaseEntity {
  private src: string;
  private foldedElemnts: Map<string, Path2DEntity> = new Map<
    string,
    Path2DEntity
  >();

  /**
   * This array contains the SVG data of the asset, it is used for rendering the SVGImageEntity.
   * In case the svg elements are unfolded any changes made to the individual Path2DEntity will be refeclted
   * this value when folded back into the SVGImageEntity.
   */
  public svgData: SVGData[] = [];

  constructor(props: SVGImageProps) {
    // TODO: implement the constructor
    const size = { x: 100, y: 100 };
    super({ ...props, size });
    this.src = props.src;

    const assetData = AssetHandler.getAsset<CachedSVGAsset[]>(this.src);
    if (!assetData) {
      throw new Error(`svg asset not found ${this.src}`);
    }

    this.createSVGDataFromAsset(assetData);
  }

  isObjectInViewport(): boolean {
    // TODO: Implement this method
    return true;
  }

  /**
   * Creates a Path2D object for each path in the SVG asset.
   */
  private createSVGDataFromAsset(assetData: CachedSVGAsset[]) {
    for (let i = 0; i < assetData.length; i++) {
      const data = assetData[i];
      const path2D = new Path2D(data.coordinates);
      this.svgData.push({
        ...data,
        coordinates: path2D,
        strokeWidth: Number(data.strokeWidth),
      });
    }
  }

  /**
   * Creates a Path2DEntity for each path in the SVG asset and adds it as a child of SVGImageEntity,
   * doing so each element of the SVG can be manipulated individually.
   */
  public unfold() {
    for (let i = 0; i < this.svgData.length; i++) {
      const path2D = new Path2DEntity({
        svgData: this.svgData[i],
        position: { x: 0, y: 0 },
        size: { x: 100, y: 100 },
        rotation: 0,
      });

      this.addChild(path2D);
    }
  }

  /**
   * Parses each Path2DEntity into a CachedSVGAsset with the updated values,
   * and then removes the Path2DEntity from the children of SVGImageEntity.
   */
  public fold() {
    this.foldedElemnts.forEach((path2D) => {
      this.removeChild(path2D.getIdAdress());
    });
  }

  /**
   * Returns true if the SVGImageEntity is folded, false otherwise.
   */
  public isFolded(): boolean {
    return this.foldedElemnts.size > 0;
  }

  render(ctx: CanvasRenderingContext2D) {
    // No need to render the SVGImageEntity if it is folded, because the path2DEntities
    // render them selves as children of the SVGImageEntity
    if (this.isFolded()) {
      return;
    }

    for (let i = 0; i < this.svgData.length; i++) {
      const data = this.svgData[i];

      ctx.save();
      ctx.transform(
        data.matrix[0][0],
        data.matrix[1][0],
        data.matrix[0][1],
        data.matrix[1][1],
        data.matrix[0][2],
        data.matrix[1][2],
      );
      ctx.translate(data.translate.x, data.translate.y);

      ctx.fillStyle = data.fill;
      ctx.strokeStyle = data.stroke;
      ctx.lineWidth = Number(data.strokeWidth);
      ctx.fill(data.coordinates);

      ctx.restore();
    }
  }
}
