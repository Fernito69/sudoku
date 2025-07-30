import type { DbSudoku, Sudoku } from '@/model/sudoku.model';

const SAVED_SUDOKU_PREFIX = 'SAVED_SUDOKU_';

export function getSudokus(): DbSudoku[] {
  const sudokus = Object.keys(localStorage)
    .filter(key => key.startsWith(SAVED_SUDOKU_PREFIX))
    .map(
      key =>
        ({
          key: key.replace(SAVED_SUDOKU_PREFIX, ''),
          sudoku: JSON.parse(localStorage.getItem(key) as string),
        }) as DbSudoku
    );
  return sudokus;
}

export function saveSudoku(sudoku: Sudoku): string | undefined {
  const name = window.prompt('Enter a name for the sudoku:');
  if (!name) return;
  localStorage.setItem(SAVED_SUDOKU_PREFIX + name, JSON.stringify(sudoku));
  return name;
}

export function deleteSudoku(key: string) {
  window.confirm(`Are you sure you want to delete Sudoku "${key}"?`) &&
    localStorage.removeItem(SAVED_SUDOKU_PREFIX + key);
}
