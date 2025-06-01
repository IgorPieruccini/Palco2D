import { Vec2 } from "../types";
import { BaseEntity } from "./BaseEntity";

export const identityMatrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export const getMatrixPosition = (x: number, y: number) => [
  [1, 0, x],
  [0, 1, y],
  [0, 0, 1],
];

export const getMatrixScale = (x: number, y: number) => [
  [x, 0, 0],
  [0, y, 0],
  [0, 0, 1],
];

export const getMatrixRotation = (rad: number) => [
  [Math.cos(rad), -Math.sin(rad), 0],
  [Math.sin(rad), Math.cos(rad), 0],
  [0, 0, 1],
];

export const getPositionFromMatrix = (matrix: number[][]) => {
  return {
    x: matrix[0][2],
    y: matrix[1][2],
  };
};

export const getScaleFromMatrix = (matrix: number[][]) => {
  const a = matrix[0][0];
  const b = matrix[1][0];
  const c = matrix[0][1];
  const d = matrix[1][1];

  const x = Math.sqrt(a * a + b * b);
  const y = Math.sqrt(c * c + d * d);

  return { x, y };
};

export function getRadFromMatrix(matrix: number[][]) {
  const cosTheta = matrix[0][0];
  const sinTheta = matrix[1][0];
  return Math.atan2(sinTheta, cosTheta);
}

export const multiplyMatrices = (A: number[][], B: number[][]) => {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error(
      "Number of columns in A must be equal to number of rows in B",
    );
  }

  const result: number[][] = [];
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsB; j++) {
      // go through the columns of B eg: 0: [7, 8, 9]
      result[i][j] = 0;
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
};

export const addMatrices = (A: number[][], B: number[][]) => {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error("Matrices must have the same dimensions");
  }

  const result: number[][] = [];
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsA; j++) {
      result[i][j] = A[i][j] + B[i][j];
    }
  }
  return result;
};

export function applyTransformation(point: Vec2, matrix: number[][]) {
  const { x, y } = point;

  // Apply the transformation matrix
  const transformedX = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2];
  const transformedY = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2];

  return { x: transformedX, y: transformedY };
}

export function inverseTransform(point: Vec2, matrix: number[][]) {
  const { x, y } = point;

  // Extract components from the transformation matrix
  const a = matrix[0][0],
    b = matrix[0][1],
    tx = matrix[0][2];
  const c = matrix[1][0],
    d = matrix[1][1],
    ty = matrix[1][2];

  // Calculate the determinant of the 2x2 submatrix
  const det = a * d - b * c;

  if (det === 0) {
    throw new Error("Matrix is not invertible");
  }

  // Inverse the 2x2 submatrix
  const invA = d / det;
  const invB = -b / det;
  const invC = -c / det;
  const invD = a / det;

  // Inverse translation
  const invTx = -(invA * tx + invB * ty);
  const invTy = -(invC * tx + invD * ty);

  // Apply the inverse transformation
  const transformedX = invA * x + invB * y + invTx;
  const transformedY = invC * x + invD * y + invTy;

  return { x: transformedX, y: transformedY };
}

export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const invertMatrix = (matrix: number[][]) => {
  const det = matrixDeterminant(matrix);
  if (det === 0) {
    return matrix;
  }
  const cofactors = cofactorMatrix3x3(matrix);
  const adjugate = transpose3x3(cofactors);

  return adjugate.map((row) => row.map((value) => value / det));
};

function matrixDeterminant(matrix: number[][]) {
  return (
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
  );
}

function det2x2(a: number, b: number, c: number, d: number) {
  return a * d - b * c;
}

function cofactorMatrix3x3(m: number[][]) {
  return [
    [
      det2x2(m[1][1], m[1][2], m[2][1], m[2][2]),
      -det2x2(m[1][0], m[1][2], m[2][0], m[2][2]),
      det2x2(m[1][0], m[1][1], m[2][0], m[2][1]),
    ],
    [
      -det2x2(m[0][1], m[0][2], m[2][1], m[2][2]),
      det2x2(m[0][0], m[0][2], m[2][0], m[2][2]),
      -det2x2(m[0][0], m[0][1], m[2][0], m[2][1]),
    ],
    [
      det2x2(m[0][1], m[0][2], m[1][1], m[1][2]),
      -det2x2(m[0][0], m[0][2], m[1][0], m[1][2]),
      det2x2(m[0][0], m[0][1], m[1][0], m[1][1]),
    ],
  ];
}

function transpose3x3(m: number[][]) {
  return [
    [m[0][0], m[1][0], m[2][0]],
    [m[0][1], m[1][1], m[2][1]],
    [m[0][2], m[1][2], m[2][2]],
  ];
}

export function getBoundingFromEntities(entities: BaseEntity[]) {
  const firstEntity = entities[0];

  if (!firstEntity) {
    throw new Error("No entities provided");
  }

  const { x, y } = firstEntity.coords.boundingBox;
  let maxX: number = x;
  let maxY: number = y;
  let minX: number = x;
  let minY: number = y;

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const boundingBox = entity.coords.boundingBox;
    const { width, height, x, y } = boundingBox;
    if (boundingBox) {
      maxX = Math.max(maxX, width / 2 + x);
      maxY = Math.max(maxY, height / 2 + y);
      minX = Math.min(minX, x - width / 2);
      minY = Math.min(minY, y - height / 2);
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


export function rotateAround(entityPosition: Vec2, pivot: Vec2, rad: number): Vec2 {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const x = entityPosition.x;
    const y = entityPosition.y;
    const px = pivot.x;
    const py = pivot.y;

    return {
      x: cos * (x - px) - sin * (y - py) + px,
      y: sin * (x - px) + cos * (y - py) + py
    }
}

export function getDistance(pointA: Vec2, pointB: Vec2): number {
   const dx = pointB.x - pointA.x;
   const dy = pointB.y - pointA.y;
   return Math.sqrt(dx * dx + dy * dy);
}
