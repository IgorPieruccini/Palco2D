import { Vec2 } from "../types";

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

export function getRotationAngleFromMatrix(matrix: number[][]) {
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
