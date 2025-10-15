import {
  ErrorClassname,
  ValidClassname,
  type CandidateCells,
  type Cell,
  type CellCandidates,
  type CellKey,
  type Error,
  type Sudoku,
  type CandidatesDict,
  type SudokuRow,
  type SudokuValidation,
  type SudokuValue,
  type CellCandidate,
  type Row,
  type Col,
  type SudokuValuesCount,
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

// Indices
const X: 0 = 0;
const Y: 1 = 1;

export const TARGET_SET: SudokuValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Indices that represent each block in the whole 81x81 grid
export const BLOCK_INDICES: Record<SudokuValue, Cell[]> = {
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

/***************************************************/
export const copy = <T>(element: T): T => {
  return JSON.parse(JSON.stringify(element)) as T;
};

export class SudokuValidator {
  private readonly sudoku: Sudoku;
  private readonly targetSet: SudokuValue[] = TARGET_SET;
  private readonly blockIndices: Record<SudokuValue, Cell[]> = BLOCK_INDICES;
  private errors: Error[] = [];

  constructor(sudoku: Sudoku) {
    this.sudoku = copy(sudoku);
  }

  public validate(): SudokuValidation {
    this.errors = [];

    return {
      errors: this.computeErrors(),
      isSolved: this.isSolved(),
      getCellClassname: (rowIndex, colIndex) =>
        this.getCellClassname(rowIndex, colIndex),
    };
  }

  private isSolved(): boolean {
    return (
      this.sudoku.every(row => row.every(v => v != null)) &&
      this.errors.length === 0
    );
  }

  public computeErrors(): Error[] {
    this.errors = [];

    // Populate the errors array
    for (const [index, blockNumber] of this.targetSet.entries()) {
      this.validateBlock(blockNumber);
      this.validateRow(index);
      this.validateCol(index);
    }

    return this.errors;
  }

  private getCellClassname(
    rowIndex: number,
    colIndex: number
  ): string | undefined {
    const cellIsValidLine = this.getValidLinesCells().some(
      ([r, c]) => r === rowIndex && c === colIndex
    );
    if (cellIsValidLine) return ValidClassname.Line;

    const cellIsValidBlock = this.getValidBlocksCells().some(
      ([r, c]) => r === rowIndex && c === colIndex
    );
    if (cellIsValidBlock) return ValidClassname.Block;

    const cellErrors = this.errors.filter(
      e => e.rowIndex === rowIndex && e.colIndex === colIndex
    );

    const blockCellError = cellErrors.some(
      e => e.className === ErrorClassname.BlockCell
    );
    if (blockCellError) return ErrorClassname.BlockCell;

    const lineError = cellErrors.find(
      e => e.className === ErrorClassname.LineCell
    );
    if (lineError) return ErrorClassname.LineCell;

    const blockError = cellErrors.some(
      e => e.className === ErrorClassname.Block
    );
    return blockError ? ErrorClassname.Block : undefined;
  }

  // Returns cells from blocks that are finished and have no errors
  private getValidBlocksCells(): Cell[] {
    const validCells: Cell[] = [];

    Object.values(this.blockIndices).forEach(indices => {
      const blockIsFilled: boolean = indices.every(
        ([row, col]) => this.sudoku[row][col] != null
      );

      const blockHasErrors: boolean = indices.some(([row, col]) =>
        this.errors.some(e => e.rowIndex === row && e.colIndex === col)
      );

      if (blockIsFilled && !blockHasErrors) {
        validCells.push(...indices);
      }
    });

    return validCells;
  }

  private getValidLinesCells(): Cell[] {
    const validCells: Cell[] = [];

    this.targetSet.forEach((_, index) => {
      // check cols
      const colIsFilled = this.sudoku.every(row => row[index] != null);
      const colHasErrors = this.errors.some(e => e.colIndex === index);

      if (colIsFilled && !colHasErrors) {
        validCells.push(
          ...(this.targetSet.map((_, row) => [row, index]) satisfies Cell[])
        );
      }

      // check rows
      const rowIsFilled = this.sudoku[index].every(val => val != null);
      const rowHasErrors = this.errors.some(e => e.rowIndex === index);

      if (rowIsFilled && !rowHasErrors) {
        validCells.push(
          ...(this.targetSet.map((_, col) => [index, col]) satisfies Cell[])
        );
      }
    });

    return validCells;
  }

  private static getRepeatedValuesFromCount(
    count: SudokuValuesCount
  ): SudokuValue[] {
    return Object.entries(count)
      .filter(([_, count]) => count > 1)
      .map(([num]) => Number(num) as SudokuValue);
  }

  private validateRow(rowIndex: number) {
    const count: SudokuValuesCount = this.sudoku[rowIndex].reduce(
      (acc, v) => (v == null ? acc : { ...acc, [v]: acc[v] ? acc[v] + 1 : 1 }),
      {} as SudokuValuesCount
    );
    const repeatedValues: SudokuValue[] =
      SudokuValidator.getRepeatedValuesFromCount(count);

    if (repeatedValues.length > 0) {
      this.sudoku[rowIndex].forEach((_, colIndex) => {
        const cellValue = this.sudoku[rowIndex][colIndex];
        if (cellValue == null) return;
        if (repeatedValues.includes(cellValue)) {
          this.errors.push({
            rowIndex,
            colIndex,
            className: ErrorClassname.LineCell,
          });
        }
      });
    }
  }

  private validateCol(colIndex: number) {
    const count: SudokuValuesCount = this.sudoku.reduce((acc, row) => {
      const cellValue = row[colIndex];
      if (cellValue == null) return acc;
      return { ...acc, [cellValue]: acc[cellValue] ? acc[cellValue] + 1 : 1 };
    }, {} as SudokuValuesCount);

    const repeatedValues: SudokuValue[] =
      SudokuValidator.getRepeatedValuesFromCount(count);

    if (repeatedValues.length > 0) {
      this.sudoku.forEach((row, rowIndex) => {
        const cellValue = row[colIndex];
        if (cellValue == null) return;
        if (repeatedValues.includes(cellValue)) {
          this.errors.push({
            rowIndex,
            colIndex,
            className: ErrorClassname.LineCell,
          });
        }
      });
    }
  }

  private validateBlock(blockNumber: SudokuValue) {
    try {
      const blockValues: (SudokuValue | undefined)[] = Object.values(
        this.blockIndices[blockNumber]
      ).map(([row, col]) => this.sudoku[row][col]);

      const count: SudokuValuesCount = blockValues.reduce(
        (acc, v) =>
          v == null ? acc : { ...acc, [v]: acc[v] ? acc[v] + 1 : 1 },
        {} as SudokuValuesCount
      );

      const repeatedValues: number[] =
        SudokuValidator.getRepeatedValuesFromCount(count);

      if (repeatedValues.length > 0) {
        // Color all cells of a block that has errors
        this.blockIndices[blockNumber].forEach(([rowIndex, colIndex]) => {
          this.errors.push({
            rowIndex,
            colIndex,
            className: ErrorClassname.Block,
          });
        });

        // Highlight repeated cells in the block
        this.blockIndices[blockNumber].forEach(([rowIndex, colIndex]) => {
          const cellValue = this.sudoku[rowIndex][colIndex];
          if (cellValue == null) return;
          if (repeatedValues.includes(cellValue)) {
            this.errors.push({
              rowIndex,
              colIndex,
              className: ErrorClassname.BlockCell,
            });
          }
        });
      }
    } catch (error) {
      throw new Error('SUDOKU:' + JSON.stringify(this.sudoku));
    }
  }
}

/***************************************************/
export class SudokuSolver {
  private readonly initialSudoku: Sudoku;
  private readonly targetSet: SudokuValue[] = TARGET_SET;
  private readonly blockIndices: Record<number, Cell[]> = BLOCK_INDICES;
  private readonly logging: boolean = true;

  private partiallySolvedSudoku: Sudoku | null = null;
  private bestAttempt: Sudoku | null = null;
  private testedCandidates: CellCandidate[] = [];

  constructor(sudoku: Sudoku) {
    this.initialSudoku = copy(sudoku);
  }

  public solve(
    initialSudoku: Sudoku = this.initialSudoku,
    iteration: number = 0
  ): Sudoku {
    let sudoku: Sudoku = copy(initialSudoku);
    const currEmptyCells: number = this.computeEmptyCells(sudoku);

    /*********************************/
    // 1. Assign all single candidates

    // If we are just starting, reset all the variables
    if (iteration === 0) {
      this.bestAttempt = copy(sudoku);
      this.partiallySolvedSudoku = null;
    }
    // Otherwise, store the best attempt so far
    else if (
      currEmptyCells < this.computeEmptyCells(this.bestAttempt!) &&
      new SudokuValidator(sudoku).validate().errors.length === 0
    ) {
      this.bestAttempt = copy(sudoku);
    }

    // Bump the iteration counter
    iteration++;

    this.logging &&
      console.log('iteration:', iteration, 'Curr empty cells:', currEmptyCells);

    // Compute all candidates per block, row and column and
    // assign all single candidates found
    this.targetSet.forEach((blockNum, index) => {
      [
        this.computeBlockCandidates(sudoku, blockNum),
        this.computeRowCandidates(sudoku, index),
        this.computeColCandidates(sudoku, index),
      ].forEach(candidates => {
        this.assignSingleCandidates(sudoku, candidates);
      });
    });

    // If the Sudoku is solved, return it
    if (new SudokuValidator(sudoku).validate().isSolved) {
      this.logging && console.log('Solved!');
      return sudoku;
    }

    // If there are still empty cells, solve recursively until we can't
    // find any more single candidates
    const newEmptyCells: number = this.computeEmptyCells(sudoku);
    if (newEmptyCells < currEmptyCells) {
      return this.solve(sudoku, iteration);
    }

    /************************************/
    // 2. Test the rest of the candidates

    // Save a state of the sudoku with all single candidates assigned
    if (this.partiallySolvedSudoku == null) {
      this.partiallySolvedSudoku = copy(sudoku);
    }

    // Test the remaining candidates in the partially solved sudoku until
    // we find the definitive solution
    while (true) {
      const cellCandidates: CellCandidate[] = this.compileCandidatesList(
        this.partiallySolvedSudoku
      );
      sudoku = copy(this.partiallySolvedSudoku);

      // Pick the first candidate that hasn't been tested yet
      const { candidate, cell } =
        cellCandidates.find(
          c =>
            !this.testedCandidates.some(
              t =>
                t.cell[X] === c.cell[X] &&
                t.cell[Y] === c.cell[Y] &&
                t.candidate === c.candidate
            )
        ) ?? {};

      // If all candidates have been tested, break the loop
      if (!candidate || !cell) break;

      // Assign the candidate to the cell and add it to the list of tested candidates
      sudoku[cell[X]][cell[Y]] = candidate;
      this.testedCandidates.push({ cell, candidate });

      // Try to solve the sudoku with the new candidate
      const newAttempt: Sudoku = this.solve(sudoku, iteration);

      // If the sudoku is solved, return it. Otherwise, continue testing with the next candidate
      if (new SudokuValidator(newAttempt).validate().isSolved) {
        return newAttempt;
      }
    }

    // If after all the candidates have been tested, no solution was found, return the best attempt
    this.logging && console.log('No solution found. Returning best attempt.');
    return this.bestAttempt || sudoku;
  }

  private computeBlockCandidates(
    sudoku: Sudoku,
    blockNum: number
  ): CellCandidates[] {
    const cellCandidates: CandidatesDict = this.compileCandidatesDict(sudoku);

    return this.blockIndices[blockNum]
      .map(cell => ({
        candidates: cellCandidates[this.stringifyKey(...cell)],
        cell,
      }))
      .filter(v => v.candidates != null);
  }

  private computeRowCandidates(sudoku: Sudoku, row: number): CellCandidates[] {
    const cellCandidates: CandidatesDict = this.compileCandidatesDict(sudoku);

    return this.targetSet
      .map((_, col) => ({
        candidates: cellCandidates[this.stringifyKey(row, col)],
        cell: [row, col] satisfies Cell,
      }))
      .filter(v => v.candidates != null);
  }

  private computeColCandidates(sudoku: Sudoku, col: number): CellCandidates[] {
    const cellCandidates: CandidatesDict = this.compileCandidatesDict(sudoku);

    return this.targetSet
      .map((_, row) => ({
        candidates: cellCandidates[this.stringifyKey(row, col)],
        cell: [row, col] satisfies Cell,
      }))
      .filter(v => v.candidates != null);
  }

  // Returns all the cells for which each candidate
  // is present in its list of candidates
  private getCandidateCells(
    cellCandidates: CellCandidates[]
  ): CandidateCells[] {
    return Object.entries(
      cellCandidates.reduce(
        (acc, { candidates, cell }) => {
          candidates.forEach(candidate => {
            acc[candidate] = acc[candidate] ?? [];
            acc[candidate].push(cell);
          });
          return acc;
        },
        {} as Record<SudokuValue, Cell[]>
      )
    ).map(([candidate, cells]) => ({
      candidate: Number(candidate) as SudokuValue,
      cells,
    }));
  }

  // Assigns the single candidates to their respective cells
  private assignSingleCandidates(
    sudoku: Sudoku,
    cellCandidates: CellCandidates[]
  ): void {
    cellCandidates
      .filter(({ candidates }) => candidates.length === 1) // Get single candidates
      .forEach(({ candidates: [candidate], cell: [row, col] }) => {
        sudoku[row][col] = candidate; // Assign the single candidate to the cell
      });

    this.getCandidateCells(cellCandidates)
      .filter(({ cells }) => cells.length === 1)
      .forEach(({ candidate, cells: [candidateCell] }) => {
        const [row, col] = candidateCell;
        sudoku[row][col] = candidate;
      });
  }

  private computeEmptyCells(sudoku: Sudoku): number {
    return sudoku.flatMap(v => v).filter(v => v == null).length;
  }

  private compileCandidatesDict(sudoku: Sudoku): CandidatesDict {
    const cellCandidates: CandidatesDict = {};

    // Rule out possible values for empty cells,
    // i.e. numbers that already appear in the same row, column, or block
    sudoku.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value != null) return;

        let candidates = [...this.targetSet];

        // Identify block
        const blockNum: number = this.targetSet.find(blockNum =>
          this.blockIndices[blockNum].some(
            ([r, c]) => r === rowIndex && c === colIndex
          )
        )!;

        // Check and remove candidates that are already in the block
        this.blockIndices[blockNum].forEach(([row, col]) => {
          const value = sudoku[row][col];
          if (value != null)
            candidates = candidates.filter(num => num !== value);
        });

        // Check and remove candidates that are already in the row
        this.targetSet.forEach((_, colIndex) => {
          const value = sudoku[rowIndex][colIndex];
          if (value != null)
            candidates = candidates.filter(num => num !== value);
        });

        // Check and remove candidates that are already in the column
        this.targetSet.forEach((_, rowIndex) => {
          const value = sudoku[rowIndex][colIndex];
          if (value != null)
            candidates = candidates.filter(num => num !== value);
        });

        // Set candidates
        cellCandidates[this.stringifyKey(rowIndex, colIndex)] = candidates;
      });
    });

    return cellCandidates;
  }

  private compileCandidatesList(sudoku: Sudoku): CellCandidate[] {
    return Object.entries(this.compileCandidatesDict(sudoku))
      .map(([key, candidates]) => ({
        candidates,
        cell: this.parseKey(key as CellKey),
      }))
      .sort((a, b) => a.candidates.length - b.candidates.length)
      .flatMap(c =>
        c.candidates.map(candidate => ({ candidate, cell: c.cell }))
      );
  }

  private stringifyKey(row: Row, col: Col): CellKey {
    return `${row}-${col}`;
  }

  private parseKey(key: CellKey): Cell {
    return key.split('-').map(Number) as Cell;
  }
}
