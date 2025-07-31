import type { Sudoku, SudokuValue } from '@/model/sudoku.model';
import { clsx } from 'clsx';
import { clamp } from 'lodash';
import { useRef } from 'react';

const GRID = 9;
// Set to true if you want wrap-around movement; false to stop at edges.
const WRAP = true;

interface Props {
  row: number;
  col: number;
  value: SudokuValue;
  setSudoku: React.Dispatch<React.SetStateAction<Sudoku>>;
  cellColor?: string;
  registerRef?: (r: number, c: number, el: HTMLInputElement | null) => void;
  focusCell?: (r: number, c: number) => void;
  isDisabled: boolean;
}

export function SudokuInput({
  row,
  col,
  value,
  setSudoku,
  cellColor,
  registerRef,
  focusCell,
  isDisabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;

    const raw = e.currentTarget.value;
    const nextVal =
      raw === ''
        ? undefined
        : (clamp(parseInt(raw, 10) || 0, 1, 9) as SudokuValue);

    setSudoku(prev => {
      const next = prev.map(r => r.slice()) as Sudoku;
      next[row][col] = nextVal;
      return next;
    });
  };

  const next = (i: number, delta: number) =>
    WRAP ? (i + delta + GRID) % GRID : clamp(i + delta, 0, GRID - 1);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    // Let modifiers do their normal thing.
    if (e.altKey || e.metaKey || e.ctrlKey) return;

    let dr = 0,
      dc = 0;
    switch (e.key) {
      case 'ArrowLeft':
        dc = -1;
        break;
      case 'ArrowRight':
        dc = 1;
        break;
      case 'ArrowUp':
        dr = -1;
        break;
      case 'ArrowDown':
        dr = 1;
        break;
      // Convenience: clear cell with Backspace/Delete/0
      case 'Backspace':
      case 'Delete':
      case '0':
        e.preventDefault();
        setSudoku(prev => {
          const copy = prev.map(r => r.slice()) as Sudoku;
          copy[row][col] = undefined;
          return copy;
        });
        return;
      default:
        return; // other keys: do nothing
    }

    // Prevent number inputs from incrementing/decrementing with arrows
    e.preventDefault();
    const nr = next(row, dr);
    const nc = next(col, dc);
    if (nr !== row || nc !== col) focusCell?.(nr, nc);
  };

  const className = clsx(
    cellColor,
    isDisabled ? 'text-black font-bold' : 'text-gray-500',
    'w-12 h-12 border-solid',
    'transition-colors',
    'focus-within:bg-gray-200',
    row % 3 === 0
      ? 'border-t-4 border-t-gray-500'
      : 'border-t border-t-gray-300',
    col % 3 === 0
      ? 'border-l-4 border-l-gray-500'
      : 'border-l border-l-gray-300',
    row === 8 ? 'border-b-4 border-b-gray-500' : 'border-b border-b-gray-300',
    col === 8 ? 'border-r-4 border-r-gray-500' : 'border-r border-r-gray-300'
  );

  return (
    <div className={className}>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={9}
        value={value ?? ''}
        onChange={handleChange}
        onFocus={() => inputRef.current?.select()}
        className={clsx(
          'w-12 h-12 text-center',
          'bg-transparent',
          'focus:outline-none',
          'focus:ring-0 focus:shadow-none',
          '[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
          '[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none'
        )}
        style={{
          width: '3rem',
          height: '3rem',
          border: 'none',
          borderRadius: 0,
          WebkitAppearance: 'textfield',
          MozAppearance: 'textfield',
          appearance: 'textfield',
          outline: 'none',
        }}
        ref={el => {
          inputRef.current = el;
          registerRef?.(row, col, el);
        }}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
