import { BoundingBox, SVGData, Vec2 } from "../../types";
import { applyTransformation, getScaleFromMatrix } from "../utils";

type BezierCurve = [number, number, number, number, number, number];

/*
 * Convert an arc svg coordinates to cubic bezier curves coordinates.
 * @param x1 - Start point x coordinate
 * @param y1 - Start point y coordinate
 * @param rx - Radius x
 * @param ry - Radius y
 * @param phi - Angle of the x axis of the ellipse
 * @param largeArcFlag - 1 if the arc is greater than 180 degrees, 0 otherwise
 * @param sweepFlag - 1 if the arc is drawn in a positive-angle direction, 0 otherwise
 * @param x2 - End point x coordinate
 * @param y2 - End point y coordinate
 */
export function arcToCubicBezier(
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  phi: number,
  largeArcFlag: number,
  sweepFlag: number,
  x2: number,
  y2: number,
): BezierCurve[] {
  const curves: BezierCurve[] = [];
  const sinPhi = Math.sin((phi * Math.PI) / 180);
  const cosPhi = Math.cos((phi * Math.PI) / 180);

  let dx = (x1 - x2) / 2;
  let dy = (y1 - y2) / 2;
  let x1p = cosPhi * dx + sinPhi * dy;
  let y1p = -sinPhi * dx + cosPhi * dy;

  let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const sqrtLambda = Math.sqrt(lambda);
    rx *= sqrtLambda;
    ry *= sqrtLambda;
  }

  const rxSq = rx * rx;
  const rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;

  let factor = Math.sqrt(
    Math.max(
      0,
      (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) /
      (rxSq * y1pSq + rySq * x1pSq),
    ),
  );
  if (largeArcFlag === sweepFlag) factor = -factor;

  const cxp = (factor * (rx * y1p)) / ry;
  const cyp = (factor * (-ry * x1p)) / rx;

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  let theta1 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
  let deltaTheta = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx) - theta1;

  if (sweepFlag === 0 && deltaTheta > 0) {
    deltaTheta -= 2 * Math.PI;
  } else if (sweepFlag === 1 && deltaTheta < 0) {
    deltaTheta += 2 * Math.PI;
  }

  const numSegments = Math.ceil(Math.abs(deltaTheta) / (Math.PI / 2));
  const delta = deltaTheta / numSegments;
  const t = ((8 / 3) * Math.pow(Math.sin(delta / 4), 2)) / Math.sin(delta / 2);

  for (let i = 0; i < numSegments; i++) {
    const angle1 = theta1 + i * delta;
    const angle2 = theta1 + (i + 1) * delta;

    const x1 = cx + rx * Math.cos(angle1);
    const y1 = cy + ry * Math.sin(angle1);
    const x2 = cx + rx * Math.cos(angle2);
    const y2 = cy + ry * Math.sin(angle2);

    const dx1 = -rx * Math.sin(angle1) * t;
    const dy1 = ry * Math.cos(angle1) * t;
    const dx2 = rx * Math.sin(angle2) * t;
    const dy2 = -ry * Math.cos(angle2) * t;

    curves.push([x1 + dx1, y1 + dy1, x2 + dx2, y2 + dy2, x2, y2]);
  }

  return curves;
}

/*
 * Calculate the bounding box of a list of SVG data.
 * goes through all the SVG data and calculates the bounding box of each path,
 * then combines all the bounding boxes to get the final bounding box.
 */
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
    throw new Error("Error calculating bounding box of the path");
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

  let current = { x: 0, y: 0 };
  let lastControlPoint: Vec2 | null = null;
  let initialPoint: Vec2 | null = null;
  for (let cmd of data.commands) {
    switch (cmd[0]) {
      case "M":
        current = { x: cmd[1], y: cmd[2] };
        updateBounds(cmd[1], cmd[2]);
        lastControlPoint = current;
        initialPoint = { x: current.x, y: current.y };
        break;
      case "m":
        current = { x: current.x + cmd[1], y: current.y + cmd[2] };
        updateBounds(current.x, current.y);
        lastControlPoint = current;
        initialPoint = { x: current.x, y: current.y };
        break;
      case "L":
        current = { x: cmd[1], y: cmd[2] };
        updateBounds(cmd[1], cmd[2]);
        lastControlPoint = current;
        break;
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
      case "A": {
        const beziers = arcToCubicBezier(
          current.x,
          current.y,
          cmd[1], // rx
          cmd[2], // ry
          cmd[3], // angle
          cmd[4], // largeArcFlag
          cmd[5], // sweepFlag
          cmd[6], // x2
          cmd[7], // y2
        );

        for (let bezier of beziers) {
          cubicBezierBounds(
            current,
            { x: bezier[0], y: bezier[1] },
            { x: bezier[2], y: bezier[3] },
            { x: bezier[4], y: bezier[5] },
          );
          current = { x: bezier[4], y: bezier[5] };
          lastControlPoint = { x: bezier[2], y: bezier[3] };
        }

        break;
      }
      case "a": {
        const beziers = arcToCubicBezier(
          current.x,
          current.y,
          cmd[1], // rx
          cmd[2], // ry
          cmd[3], // angle
          cmd[4], // largeArcFlag
          cmd[5], // sweepFlag
          current.x + cmd[6], // x2
          current.y + cmd[7], // y2
        );

        for (let bezier of beziers) {
          cubicBezierBounds(
            current,
            { x: bezier[0], y: bezier[1] },
            { x: bezier[2], y: bezier[3] },
            { x: bezier[4], y: bezier[5] },
          );
          current = { x: bezier[4], y: bezier[5] };
          lastControlPoint = { x: bezier[2], y: bezier[3] };
        }

        break;
      }
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
        if (initialPoint) {
          current = initialPoint;
        }
        break;
    }
  }

  if (minX === null || minY === null || maxX === null || maxY === null) {
    throw new Error("Error calculating bounding box of commands");
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
