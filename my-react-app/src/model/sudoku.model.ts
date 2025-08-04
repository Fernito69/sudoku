export type SudokuValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SudokuRow = [
  SudokuValue | undefined,
  SudokuValue | undefined,
  SudokuValue | undefined,
  SudokuValue | undefined,
  SudokuValue | undefined,
  SudokuValue | undefined,
  SudokuValue | undefined,
  SudokuValue | undefined,
  SudokuValue | undefined,
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

export enum ErrorClassname {
  BlockCell = 'bg-red-500 text-white',
  LineCell = 'bg-orange-500 text-white',
  Block = 'bg-red-300',
}

export enum ValidClassname {
  Block = 'bg-green-200',
  Line = 'bg-green-300',
}

// TODO: Row and Col should be numbers from 0 to 8
export type Row = number;
export type Col = number;
export type Cell = [Row, Col];

export interface Error {
  row: Row;
  col: Col;
  className: ErrorClassname;
}

/***********/
// Validator
export interface SudokuValidation {
  errors: Error[];
  isSolved: boolean;
  getCellClassname: (rowIndex: Row, colIndex: Col) => string | undefined;
}

/***********/
// "DB" Model
export interface DbSudoku {
  key: string;
  sudoku: Sudoku;
}

/***********/
// Solver
export type CellKey = `${Row}-${Col}`;
export type CandidatesDict = Record<CellKey, SudokuValue[]>;
export type CellCandidates = {
  cell: Cell;
  candidates: SudokuValue[];
};
export type CellCandidate = {
  cell: Cell;
  candidate: SudokuValue;
};
export type CandidateCells = {
  candidate: SudokuValue;
  cells: Cell[];
};
