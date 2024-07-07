import { Vec2 } from "./types";

export const identityMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

export const getMatrixPosition = (x: number, y: number) => [
  [1, 0, x],
  [0, 1, y],
  [0, 0, 1]
];

export const getMatrixScale = (x: number, y: number) => [
  [x, 0, 0],
  [0, y, 0],
  [0, 0, 1]
];

export const getMatrixRotation = (rad: number) => [
  [Math.cos(rad), -Math.sin(rad), 0],
  [Math.sin(rad), Math.cos(rad), 0],
  [0, 0, 1]
];

export const getPositionFromMatrix = (matrix: number[][]) => {
  return {
    x: matrix[0][2],
    y: matrix[1][2]
  }
}

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
    throw new Error('Number of columns in A must be equal to number of rows in B');
  }

  const result: number[][] = [];
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsB; j++) { // go through the columns of B eg: 0: [7, 8, 9]
      result[i][j] = 0;
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

export const addMatrices = (A: number[][], B: number[][]) => {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrices must have the same dimensions');
  }

  const result: number[][] = [];
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsA; j++) {
      result[i][j] = A[i][j] + B[i][j];
    }
  }
  return result;
}

export const applyTransformation = (vector: Vec2, matrix: number[][]) => {
  const vec = [vector.x, vector.y, 1];
  const result = multiplyMatrices(matrix, [vec]);
  return { x: result[0][0], y: result[1][0] };
}

