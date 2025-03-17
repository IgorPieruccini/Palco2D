import { BoundingBox, SVGData, Vec2 } from "../../types";
import { applyTransformation, getScaleFromMatrix } from "../utils";

export function calculateSVGBoundingBox(svgsData: Array<SVGData>): BoundingBox {
  let minX = null;
  let minY = null;
  let maxX = null;
  let maxY = null;

  for (let i = 0; i < svgsData.length; i++) {
    const svgData = svgsData[i];
    const { x, y, width, height } = calculatePathBoundingBox(svgData);

    let transformedPosition = applyTransformation(
      {
        x: x + svgData.translate.x,
        y: y + svgData.translate.y,
      },
      svgData.matrix,
    );

    const matrixScale = getScaleFromMatrix(svgData.matrix);

    const transformedSize = {
      x: width * matrixScale.x,
      y: height * matrixScale.y,
    };

    // APPLYING TRANSFORM IS NOT WORKING ON THIS CASE
    // let transformedSize = applyTransformation(
    //   { x: width, y: height },
    //   svgData.matrix,
    // );

    if (minX === null || minY === null || maxX === null || maxY === null) {
      minX = transformedPosition.x;
      minY = transformedPosition.y;
      maxX = transformedPosition.x + transformedSize.x;
      maxY = transformedPosition.y + transformedSize.y;
      continue;
    }

    minX = Math.min(minX, transformedPosition.x);
    minY = Math.min(minY, transformedPosition.y);
    maxX = Math.max(maxX, transformedPosition.x + transformedSize.x);
    maxY = Math.max(maxY, transformedPosition.y + transformedSize.y);
  }

  if (minX === null || minY === null || maxX === null || maxY === null) {
    // TODO: add a better error message
    throw new Error("Error calculating bounding box");
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function calculatePathBoundingBox(data: SVGData): BoundingBox {
  let minX: number | null = null;
  let minY: number | null = null;
  let maxX: number | null = null;
  let maxY: number | null = null;

  function updateBounds(x: number, y: number) {
    if (minX === null || minY === null || maxX === null || maxY === null) {
      minX = x;
      maxX = x;
      minY = y;
      maxY = y;
      return;
    }

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  /**
   * @param p0 - Start point
   * @param cp - Control point
   * @param p1 - End point
   */
  function quadraticBezierBounds(p0: Vec2, cp: Vec2, p1: Vec2) {
    let tx = (p0.x - cp.x) / (p0.x - 2 * cp.x + p1.x);
    let ty = (p0.y - cp.y) / (p0.y - 2 * cp.y + p1.y);

    updateBounds(p0.x, p0.y);
    updateBounds(p1.x, p1.y);

    [tx, ty].forEach((t) => {
      if (t > 0 && t < 1) {
        let x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * cp.x + t ** 2 * p1.x;
        let y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * cp.y + t ** 2 * p1.y;
        updateBounds(x, y);
      }
    });
  }

  /**
   * @param p0 - Start point
   * @param p1 - First control point
   * @param p2 - Second control point
   * @param p3 - End point
   */
  function cubicBezierBounds(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2) {
    function extrema(p0: number, p1: number, p2: number, p3: number): number[] {
      let a = -p0 + 3 * p1 - 3 * p2 + p3;
      let b = 2 * (p0 - 2 * p1 + p2);
      let c = p1 - p0;
      let discriminant = b * b - 4 * a * c;
      let ts: number[] = [];

      if (discriminant >= 0) {
        let sqrtD = Math.sqrt(discriminant);
        let t1 = (-b + sqrtD) / (2 * a);
        let t2 = (-b - sqrtD) / (2 * a);
        [t1, t2].forEach((t) => t > 0 && t < 1 && ts.push(t));
      }

      return ts;
    }

    updateBounds(p0.x, p0.y);
    updateBounds(p3.x, p3.y);

    extrema(p0.x, p1.x, p2.x, p3.x).forEach((t) => {
      let x =
        (1 - t) ** 3 * p0.x +
        3 * (1 - t) ** 2 * t * p1.x +
        3 * (1 - t) * t ** 2 * p2.x +
        t ** 3 * p3.x;
      updateBounds(x, minY as number);
    });

    extrema(p0.y, p1.y, p2.y, p3.y).forEach((t) => {
      let y =
        (1 - t) ** 3 * p0.y +
        3 * (1 - t) ** 2 * t * p1.y +
        3 * (1 - t) * t ** 2 * p2.y +
        t ** 3 * p3.y;
      updateBounds(minX as number, y);
    });
  }

  function arcBounds(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ) {
    let points = [
      { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) },
      { x: cx + r * Math.cos(endAngle), y: cy + r * Math.sin(endAngle) },
    ];

    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((angle) => {
      if (startAngle <= angle && angle <= endAngle) {
        points.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      }
    });

    points.forEach((p) => updateBounds(p.x, p.y));
  }

  let current = { x: 0, y: 0 };
  let lastControlPoint: Vec2 | null = null;

  for (let cmd of data.commands) {
    switch (cmd[0]) {
      case "M":
      case "L":
        current = { x: cmd[1], y: cmd[2] };
        updateBounds(cmd[1], cmd[2]);
        lastControlPoint = current;
        break;
      case "m":
      case "l":
        current = { x: current.x + cmd[1], y: current.y + cmd[2] };
        updateBounds(current.x, current.y);
        lastControlPoint = current;
        break;
      case "H":
        current.x = cmd[1];
        updateBounds(current.x, current.y);
        lastControlPoint = current;
        break;
      case "h":
        current.x += cmd[1];
        updateBounds(current.x, current.y);
        lastControlPoint = current;
        break;
      case "V":
        current.y = cmd[1];
        updateBounds(current.x, current.y);
        lastControlPoint = current;
        break;
      case "v":
        current.y += cmd[1];
        updateBounds(current.x, current.y);
        lastControlPoint = current;
        break;
      case "C":
        cubicBezierBounds(
          current,
          { x: cmd[1], y: cmd[2] },
          { x: cmd[3], y: cmd[4] },
          { x: cmd[5], y: cmd[6] },
        );
        current = { x: cmd[5], y: cmd[6] };
        lastControlPoint = { x: cmd[3], y: cmd[4] };
        break;
      case "c":
        cubicBezierBounds(
          current,
          { x: current.x + cmd[1], y: current.y + cmd[2] },
          { x: current.x + cmd[3], y: current.y + cmd[4] },
          { x: current.x + cmd[5], y: current.y + cmd[6] },
        );
        current = { x: current.x + cmd[5], y: current.y + cmd[6] };
        lastControlPoint = { x: current.x + cmd[3], y: current.y + cmd[4] };
        break;
      case "S":
        // first control point is the reflection of the last control point
        if (lastControlPoint === null) {
          lastControlPoint = current;
        }

        const firstControlPoint = {
          x: 2 * current.x - lastControlPoint!.x,
          y: 2 * current.y - lastControlPoint!.y,
        };

        cubicBezierBounds(
          current,
          firstControlPoint,
          { x: cmd[1], y: cmd[2] },
          { x: cmd[3], y: cmd[4] },
        );
        current = { x: cmd[3], y: cmd[4] };
        lastControlPoint = { x: cmd[1], y: cmd[2] };
        break;
      case "s": {
        // first control point is the reflection of the last control point
        if (lastControlPoint === null) {
          lastControlPoint = current;
        }

        const firstControlPoint = {
          x: 2 * current.x - lastControlPoint!.x,
          y: 2 * current.y - lastControlPoint!.y,
        };

        cubicBezierBounds(
          current,
          firstControlPoint,
          { x: current.x + cmd[1], y: current.y + cmd[2] },
          { x: current.x + cmd[3], y: current.y + cmd[4] },
        );

        current = { x: current.x + cmd[3], y: current.y + cmd[4] };
        lastControlPoint = { x: current.x + cmd[1], y: current.y + cmd[2] };
        break;
      }
      case "A":
        arcBounds(current.x, current.y, cmd[1], cmd[2], cmd[2] + cmd[3]);
        current = { x: cmd[6], y: cmd[7] };
        lastControlPoint = current;

        break;
      case "a":
        arcBounds(current.x, current.y, cmd[1], cmd[2], cmd[2] + cmd[3]);
        current = { x: current.x + cmd[6], y: current.y + cmd[7] };
        lastControlPoint = current;

        break;
      case "Q":
        quadraticBezierBounds(
          current,
          { x: cmd[1], y: cmd[2] },
          { x: cmd[3], y: cmd[4] },
        );
        current = { x: cmd[3], y: cmd[4] };
        lastControlPoint = current;
        break;
      case "q":
        quadraticBezierBounds(
          current,
          { x: current.x + cmd[1], y: current.y + cmd[2] },
          { x: current.x + cmd[3], y: current.y + cmd[4] },
        );
        current = { x: current.x + cmd[3], y: current.y + cmd[4] };
        lastControlPoint = current;
        break;
      case "T":
      case "t":
        quadraticBezierBounds(current, current, { x: cmd[1], y: cmd[2] });
        current = { x: cmd[1], y: cmd[2] };
        lastControlPoint = current;
        break;
      case "Z":
      case "z":
        break;
    }
  }

  if (minX === null || minY === null || maxX === null || maxY === null) {
    // TODO: add a better error message
    throw new Error("Error calculating bounding box");
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
