export type SudokuValue = number | undefined;
export type SudokuRow = [
  SudokuValue,
  SudokuValue,
  SudokuValue,
  SudokuValue,
  SudokuValue,
  SudokuValue,
  SudokuValue,
  SudokuValue,
  SudokuValue,
];
export type Sudoku = [
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
];

export enum ErrorColor {
  BlockCell = 'bg-red-500 text-white',
  LineCell = 'bg-orange-500 text-white',
  Block = 'bg-red-300',
}

export enum ValidColor {
  Valid = 'bg-green-200',
}

export interface Error {
  row: number;
  col: number;
  color: ErrorColor;
}

export type Cell = [number, number];

export interface Validation {
  errors: Error[];
  validBlocksCells: Cell[];
  isFilled: boolean;
}
