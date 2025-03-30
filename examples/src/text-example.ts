import { AssetHandler, Scene, Text } from "@palco-2d/core";

export class TextExample extends Scene {
  public async start() {
    await AssetHandler.loadFont(
      "PixelifySans",
      "assets/PixelifySans-Regular.ttf",
    );
    await AssetHandler.loadFont("BebasNeue", "assets/BebasNeue-Regular.ttf");

    const addEventsToText = (text: Text) => {
      text.on("mouseenter", () => {
        text.color = "red";
      });

      text.on("mouseleave", () => {
        text.color = "white";
      });

      text.on("mousedown", () => {
        if (text.text === "Clicked!") {
          text.text = "Click me!";
          return;
        }
        text.text = "Clicked!";
      });
    };

    const parentText = new Text({
      id: "text-parent",
      text: "Click me!",
      color: "white",
      font: "PixelifySans",
      fontSize: 50,
      position: { x: 200, y: 300 },
      rotation: 45,
    });
    addEventsToText(parentText);

    const childText = new Text({
      id: "text-child",
      text: "Click me!",
      color: "white",
      stroke: {
        strokeColor: "blue",
        lineWidth: 10,
      },
      font: "BebasNeue",
      fontSize: 100,
      position: { x: 100, y: 100 },
      rotation: 0,
      shadow: {
        shadowColor: "black",
        shadowBlur: 0,
        shadowOffsetX: 10,
        shadowOffsetY: 2,
      },
    });
    addEventsToText(childText);

    parentText.addChild(childText);

    this.addEntities([parentText]);
    this.render.startRender();
    this.mouseHandler.start();
  }
}
