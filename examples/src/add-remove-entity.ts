import { AssetHandler, Scene, Sprite } from "@palco-2d/core";

export class AddRemoveEntityExample extends Scene {
  public async start() {
    await AssetHandler().loadPng("assets/ninja-frog-jump.png");

    const createFrog = (x: number, y: number) => {
      const frog = new Sprite({
        texture: "assets/ninja-frog-jump.png",
        position: { x, y },
        rotation: 0,
      });

      frog.on("mousedown", () => {
        this.mouseHandler.removeEntity(frog);
        this.render.removeEntity(frog);
      });

      frog.on("mouseenter", () => {
        frog.size = { x: 64, y: 64 };
      });

      frog.on("mouseleave", () => {
        frog.size = { x: 32, y: 32 };
      });
      return frog;
    };

    for (let x = 0; x < 20; x++) {
      const frog = createFrog(200 + x * 50, 100);
      frog.addChild(createFrog(0, 100));

      this.render.addEntity(frog);
      this.mouseHandler.addEntity(frog);
    }

    this.canvas.addEventListener("mousedown", (e: MouseEvent) => {
      if (this.mouseHandler.hoveredEntities.length > 0) return;
      const frog = createFrog(e.clientX, e.clientY);
      this.render.addEntity(frog);
      this.mouseHandler.addEntity(frog);
    });

    this.render.startRender();
    this.mouseHandler.start();
  }
}
