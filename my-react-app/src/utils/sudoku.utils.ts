import {
  ErrorColor,
  type Error,
  type Sudoku,
  type SudokuRow,
  type Validation,
  type Cell,
} from '@/model/sudoku.model';

// Defaults
export const BASE_ROW: SudokuRow = [
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
];

export const BASE_SUDOKU: Sudoku = [
  BASE_ROW,
  BASE_ROW,
  BASE_ROW,
  BASE_ROW,
  BASE_ROW,
  BASE_ROW,
  BASE_ROW,
  BASE_ROW,
  BASE_ROW,
];

// Block
export const BLOCK_INDICES: Record<number, [number, number][]> = {
  1: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  2: [
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 3],
    [2, 4],
    [2, 5],
  ],
  3: [
    [0, 6],
    [0, 7],
    [0, 8],
    [1, 6],
    [1, 7],
    [1, 8],
    [2, 6],
    [2, 7],
    [2, 8],
  ],
  4: [
    [3, 0],
    [3, 1],
    [3, 2],
    [4, 0],
    [4, 1],
    [4, 2],
    [5, 0],
    [5, 1],
    [5, 2],
  ],
  5: [
    [3, 3],
    [3, 4],
    [3, 5],
    [4, 3],
    [4, 4],
    [4, 5],
    [5, 3],
    [5, 4],
    [5, 5],
  ],
  6: [
    [3, 6],
    [3, 7],
    [3, 8],
    [4, 6],
    [4, 7],
    [4, 8],
    [5, 6],
    [5, 7],
    [5, 8],
  ],
  7: [
    [6, 0],
    [6, 1],
    [6, 2],
    [7, 0],
    [7, 1],
    [7, 2],
    [8, 0],
    [8, 1],
    [8, 2],
  ],
  8: [
    [6, 3],
    [6, 4],
    [6, 5],
    [7, 3],
    [7, 4],
    [7, 5],
    [8, 3],
    [8, 4],
    [8, 5],
  ],
  9: [
    [6, 6],
    [6, 7],
    [6, 8],
    [7, 6],
    [7, 7],
    [7, 8],
    [8, 6],
    [8, 7],
    [8, 8],
  ],
};

export class SudokuValidator {
  private sudoku: Sudoku;
  private targetSet: Set<number> = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  private errors: Error[] = [];
  private blockIndices: Record<number, [number, number][]>;

  constructor(sudoku: Sudoku, blockIndices: Record<number, [number, number][]> = BLOCK_INDICES) {
    this.sudoku = sudoku;
    this.blockIndices = blockIndices;
  }

  public isFilled(): boolean {
    return this.sudoku.every(row => row.every(v => v !== undefined));
  }

  public validate(): Validation {
    this.errors = [];

    for (const [index, num] of Array.from(this.targetSet).entries()) {
      this.validateBlock(num);
      this.validateRow(index);
      this.validateCol(index);
    }

    return {
      errors: this.errors,
      validBlocksCells: this.getValidBlocksCells(),
      isFilled: this.isFilled(),
    };
  }

  // Returns cells from blocks that are finished and have no errors
  private getValidBlocksCells(): Cell[] {
    const validCells: Cell[] = [];

    Object.values(this.blockIndices).forEach(indices => {
      const blockIsFilled: boolean = indices.every(
        ([row, col]) => this.sudoku[row][col] !== undefined
      );

      const blockHasErrors: boolean = indices.some(([row, col]) =>
        this.errors.some((e) => e.row === row && e.col === col)
      );

      if (blockIsFilled && !blockHasErrors) {
        validCells.push(...indices);
      }
    });

    return validCells;
  }

  private validateRow(row: number) {
    const count = this.sudoku[row].reduce(
      (acc, v) => (v === undefined ? acc : { ...acc, [v]: acc[v] ? acc[v] + 1 : 1 }),
      {} as Record<number, number>
    );
    const repeatedValues = Object.entries(count)
      .filter(([_, count]) => count > 1)
      .map(([num]) => Number(num));

    if (repeatedValues.length > 0) {
      this.sudoku[row].forEach((_, col) => {
        const cellValue = this.sudoku[row][col];
        if (cellValue === undefined) return;
        if (repeatedValues.includes(cellValue)) {
          this.errors.push({ row, col, color: ErrorColor.LineCell });
        }
      });
    }
  }

  private validateCol(col: number) {
    const count = this.sudoku.reduce(
      (acc, row) => {
        const cellValue = row[col];
        if (cellValue === undefined) return acc;
        return { ...acc, [cellValue]: acc[cellValue] ? acc[cellValue] + 1 : 1 };
      },
      {} as Record<number, number>
    );

    const repeatedValues = Object.entries(count)
      .filter(([_, count]) => count > 1)
      .map(([num]) => Number(num));

    if (repeatedValues.length > 0) {
      this.sudoku.forEach((row, rowIndex) => {
        const cellValue = row[col];
        if (cellValue === undefined) return;
        if (repeatedValues.includes(cellValue)) {
          this.errors.push({ row: rowIndex, col, color: ErrorColor.LineCell });
        }
      });
    }
  }

  private validateBlock(block: number) {
    const blockValues = Object.values(BLOCK_INDICES[block]).map(
      ([row, col]) => this.sudoku[row][col]
    );
    const count = blockValues.reduce(
      (acc, v) => (v === undefined ? acc : { ...acc, [v]: acc[v] ? acc[v] + 1 : 1 }),
      {} as Record<number, number>
    );

    const repeatedValues = Object.entries(count)
      .filter(([_, count]) => count > 1)
      .map(([num]) => Number(num));

    if (repeatedValues.length > 0) {
      // Color block cells
      this.blockIndices[block].forEach(([row, col]) => {
        this.errors.push({ row, col, color: ErrorColor.Block });
      });

      // Color repeated cells
      this.blockIndices[block].forEach(([row, col]) => {
        const cellValue = this.sudoku[row][col];
        if (cellValue === undefined) return;
        if (repeatedValues.includes(cellValue)) {
          this.errors.push({ row, col, color: ErrorColor.BlockCell });
        }
      });
    }
  }
}
