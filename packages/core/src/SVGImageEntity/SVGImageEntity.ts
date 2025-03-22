import { CachedSVGAsset, SVGData, SVGImageProps, Vec2 } from "../../types";
import { AssetHandler } from "../AssetHandler";
import { BaseEntity } from "../BaseEntity";
import { applyTransformation } from "../utils";
import { Path2DEntity } from "./Path2DEntity";
import { calculateSVGBoundingBox } from "./utils";

export class SVGImageEntity extends BaseEntity {
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
    const assetData = AssetHandler.getAsset<CachedSVGAsset[]>(props.src);

    if (!assetData) {
      throw new Error(`svg asset not found ${props.src}`);
    }

    // Set the size to infinity, as we need to create the svg data to calculate the bounding box.
    const size = { x: Infinity, y: Infinity };

    super({ ...props, size });

    this.createSVGDataFromAsset(assetData);

    // Update the bounding box after creating the SVGData
    this.updateBoundingBox();
    // with the bounding box updated we can set the size to the initial size.
    this.initialSize = {
      x: this.boundingBox.width,
      y: this.boundingBox.height,
    };
    this.size = { x: this.boundingBox.width, y: this.boundingBox.height };
  }

  /**
   * Checks if the SVGImageEntity is in the viewport.
   * @override - BaseEntity
   */
  isObjectInViewport(): boolean {
    // TODO: Implement this method
    return true;
  }

  /**
   * Updates the bounding box of the SVGImageEntity based on the current SVGData.
   * @override - BaseEntity
   */
  public updateBoundingBox() {
    const bounds = calculateSVGBoundingBox(this.svgData);
    this.boundingBox = bounds;
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
   *
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
    super.render(ctx);
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

    this.renderEntityPlugins(ctx);
  }
}
