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
  Block = 'bg-green-200',
  Line = 'bg-green-300',
}

export interface Error {
  row: number;
  col: number;
  color: ErrorColor;
}

export type Cell = [number, number];

export interface Validation {
  errors: Error[];
  isFilled: boolean;
  getCellColor: (rowIndex: number, colIndex: number) => string | undefined;
}

export interface DbSudoku {
  key: string;
  sudoku: Sudoku;
}
