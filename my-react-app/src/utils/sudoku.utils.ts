import {
  ErrorClassname,
  ValidClassname,
  type CandidateCells,
  type Cell,
  type CellCandidates,
  type CellKey,
  type Error,
  type Sudoku,
  type SudokuCandidatesDict,
  type SudokuRow,
  type SudokuValidation,
  type SudokuValue,
  type CellCandidate,
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

// Indices that represent each block in the whole 81x81 grid
export const BLOCK_INDICES: Record<number, Cell[]> = {
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
export class SudokuValidator {
  private readonly sudoku: Sudoku;
  private readonly targetSet: SudokuValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  private readonly blockIndices: Record<number, Cell[]>;
  private errors: Error[] = [];

  constructor(sudoku: Sudoku) {
    this.sudoku = JSON.parse(JSON.stringify(sudoku));
    this.blockIndices = BLOCK_INDICES;
  }

  public validate(): SudokuValidation {
    this.errors = [];

    return {
      errors: this.computeErrors(),
      isFinished: this.isFinished(),
      getCellClassname: this.getCellClassname.bind(this),
    };
  }

  private isFinished(): boolean {
    return (
      this.sudoku.every(row => row.every(v => v != null)) &&
      this.errors.length === 0
    );
  }

  public computeErrors(): Error[] {
    this.errors = [];

    // Populate the errors array
    for (const [index, num] of this.targetSet.entries()) {
      this.validateBlock(num);
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
      e => e.row === rowIndex && e.col === colIndex
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
        this.errors.some(e => e.row === row && e.col === col)
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
      const colHasErrors = this.errors.some(e => e.col === index);

      if (colIsFilled && !colHasErrors) {
        validCells.push(
          ...(this.targetSet.map((_, row) => [row, index]) as Cell[])
        );
      }

      // check rows
      const rowIsFilled = this.sudoku[index].every(val => val != null);
      const rowHasErrors = this.errors.some(e => e.row === index);

      if (rowIsFilled && !rowHasErrors) {
        validCells.push(
          ...(this.targetSet.map((_, col) => [index, col]) as Cell[])
        );
      }
    });

    return validCells;
  }

  private validateRow(row: number) {
    const count = this.sudoku[row].reduce(
      (acc, v) => (v == null ? acc : { ...acc, [v]: acc[v] ? acc[v] + 1 : 1 }),
      {} as Record<number, number>
    );
    const repeatedValues = Object.entries(count)
      .filter(([_, count]) => count > 1)
      .map(([num]) => Number(num));

    if (repeatedValues.length > 0) {
      this.sudoku[row].forEach((_, col) => {
        const cellValue = this.sudoku[row][col];
        if (cellValue == null) return;
        if (repeatedValues.includes(cellValue)) {
          this.errors.push({ row, col, className: ErrorClassname.LineCell });
        }
      });
    }
  }

  private validateCol(col: number) {
    const count = this.sudoku.reduce(
      (acc, row) => {
        const cellValue = row[col];
        if (cellValue == null) return acc;
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
        if (cellValue == null) return;
        if (repeatedValues.includes(cellValue)) {
          this.errors.push({
            row: rowIndex,
            col,
            className: ErrorClassname.LineCell,
          });
        }
      });
    }
  }

  private validateBlock(block: number) {
    try {
      const blockValues = Object.values(BLOCK_INDICES[block]).map(
        ([row, col]) => this.sudoku[row][col]
      );
      const count = blockValues.reduce(
        (acc, v) =>
          v == null ? acc : { ...acc, [v]: acc[v] ? acc[v] + 1 : 1 },
        {} as Record<number, number>
      );

      const repeatedValues = Object.entries(count)
        .filter(([_, count]) => count > 1)
        .map(([num]) => Number(num));

      if (repeatedValues.length > 0) {
        // Color block cells
        this.blockIndices[block].forEach(([row, col]) => {
          this.errors.push({ row, col, className: ErrorClassname.Block });
        });

        // Color repeated cells
        this.blockIndices[block].forEach(([row, col]) => {
          const cellValue = this.sudoku[row][col];
          if (cellValue == null) return;
          if (repeatedValues.includes(cellValue)) {
            this.errors.push({ row, col, className: ErrorClassname.BlockCell });
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
  private readonly targetSet: SudokuValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  private readonly blockIndices: Record<number, Cell[]> = BLOCK_INDICES;
  private readonly logging: boolean = true;

  private partiallySolvedSudoku: Sudoku | null = null;
  private bestAttempt: Sudoku | null = null;
  private testedCandidates: CellCandidate[] = [];

  constructor(sudoku: Sudoku) {
    this.initialSudoku = this.cloneDeep(sudoku);
  }

  public solve(
    initialSudoku: Sudoku = this.initialSudoku,
    currEmptyCells: number = this.computeEmptyCells(initialSudoku),
    depth: number = 0
  ): Sudoku {
    this.logging &&
      console.log('iteration:', ++depth, 'Curr empty cells:', currEmptyCells);

    let sudoku = this.cloneDeep(initialSudoku);

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
    if (new SudokuValidator(sudoku).validate().isFinished) {
      this.logging && console.log('Solved!');
      return sudoku;
    }

    // If there are still empty cells, solve recursively until we can't
    // find any more single candidates
    const newEmptyCells = this.computeEmptyCells(sudoku);
    if (newEmptyCells < currEmptyCells) {
      return this.solve(sudoku, newEmptyCells, depth);
    }

    // Save a state of the sudoku with all single candidates assigned
    if (this.partiallySolvedSudoku == null) {
      this.partiallySolvedSudoku = this.cloneDeep(sudoku);
    }

    // Begin trying the remaining candidates in the partially solved sudoku until
    // we find the definitive solution
    while (true) {
      const cellCandidates: CellCandidate[] = this.compileCandidatesList(
        this.partiallySolvedSudoku
      );
      sudoku = this.cloneDeep(this.partiallySolvedSudoku);

      // Pick the first candidate that hasn't been tested yet
      const { candidate, cell } =
        cellCandidates.find(
          c =>
            !this.testedCandidates.some(
              t =>
                t.cell[0] === c.cell[0] &&
                t.cell[1] === c.cell[1] &&
                t.candidate === c.candidate
            )
        ) ?? {};

      // If all candidates have been tested, break the loop
      if (!candidate || !cell) break;

      // Assign the candidate to the cell and add it to the list of tested candidates
      sudoku[cell[0]][cell[1]] = candidate;
      this.testedCandidates.push({ cell, candidate });

      // Try to solve the sudoku with the new candidate
      const newAttempt = this.solve(
        sudoku,
        this.computeEmptyCells(sudoku),
        depth
      );

      const { errors, isFinished } = new SudokuValidator(newAttempt).validate();

      // If the sudoku is solved, return it. Otherwise, save the best attempt and continue
      if (isFinished) {
        this.logging && console.log('Solved!');
        return newAttempt;
      } else if (
        errors.length === 0 &&
        (this.bestAttempt == null ||
          this.computeEmptyCells(newAttempt) <
            this.computeEmptyCells(this.bestAttempt))
      ) {
        this.bestAttempt = this.cloneDeep(newAttempt);
      }
    }
    console.log('No solution found', this.bestAttempt, sudoku);
    return this.bestAttempt || sudoku;
  }

  private cloneDeep(sudoku: Sudoku): Sudoku {
    return JSON.parse(JSON.stringify(sudoku)) as Sudoku;
  }

  private computeBlockCandidates(
    sudoku: Sudoku,
    blockNum: number
  ): CellCandidates[] {
    const cellCandidates: SudokuCandidatesDict =
      this.compileCandidatesDict(sudoku);

    return this.blockIndices[blockNum]
      .map(([row, col]) => ({
        candidates: cellCandidates[this.stringifyKey(row, col)],
        cell: [row, col] satisfies Cell,
      }))
      .filter(v => v.candidates != null);
  }

  private computeRowCandidates(sudoku: Sudoku, row: number): CellCandidates[] {
    const cellCandidates: SudokuCandidatesDict =
      this.compileCandidatesDict(sudoku);

    return this.targetSet
      .map((_, col) => ({
        candidates: cellCandidates[this.stringifyKey(row, col)],
        cell: [row, col] satisfies Cell,
      }))
      .filter(v => v.candidates != null);
  }

  private computeColCandidates(sudoku: Sudoku, col: number): CellCandidates[] {
    const cellCandidates: SudokuCandidatesDict =
      this.compileCandidatesDict(sudoku);

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
      .filter(({ candidates }) => candidates.length === 1)
      .forEach(({ candidates, cell: [row, col] }) => {
        sudoku[row][col] = candidates[0];
      });

    this.getCandidateCells(cellCandidates)
      .filter(({ cells }) => cells.length === 1)
      .forEach(({ candidate, cells }) => {
        cells.forEach(([row, col]) => {
          sudoku[row][col] = candidate;
        });
      });
  }

  private computeEmptyCells(sudoku: Sudoku): number {
    return sudoku.flatMap(v => v).filter(v => v == null).length;
  }

  private compileCandidatesDict(sudoku: Sudoku): SudokuCandidatesDict {
    const cellCandidates: SudokuCandidatesDict = {};

    // Rule out possible values for empty cells,
    // i.e. numbers that already appear in the same row, column, or block
    sudoku.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value != null) return;

        let candidates = [...this.targetSet];

        // Identify block
        const blockNum: number = this.targetSet.find(num =>
          this.blockIndices[num].some(
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
        this.targetSet.forEach((_, col) => {
          const value = sudoku[rowIndex][col];
          if (value != null)
            candidates = candidates.filter(num => num !== value);
        });

        // Check and remove candidates that are already in the column
        this.targetSet.forEach((_, row) => {
          const value = sudoku[row][colIndex];
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

  private stringifyKey(row: number, col: number): CellKey {
    return `${row}-${col}`;
  }

  private parseKey(key: CellKey): Cell {
    const [row, col] = key.split('-');
    return [Number(row), Number(col)];
  }
}