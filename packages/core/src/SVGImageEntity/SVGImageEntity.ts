import { CachedSVGAsset, SVGImageProps } from "../../types";
import { AssetHandler } from "../AssetHandler";
import { BaseEntity } from "../BaseEntity";
import { Path2DEntity } from "./Path2DEntity";

export class SVGImageEntity extends BaseEntity {
  private src: string;

  constructor(props: SVGImageProps) {
    super(props);
    this.src = props.src;
    this.create2DPaths();
  }

  create2DPaths() {
    const paths2D = AssetHandler.getAsset<CachedSVGAsset[]>(this.src);
    console.log(paths2D);

    if (!paths2D) {
      throw new Error(`svg asset not found ${this.src}`);
    }

    for (let i = 0; i < paths2D.length; i++) {
      const path2D = new Path2DEntity({
        ...paths2D[i],
        position: { x: 0, y: 0 },
        size: { x: 100, y: 100 },
        rotation: 0,
      });

      this.addChild(path2D);
    }
  }
}
