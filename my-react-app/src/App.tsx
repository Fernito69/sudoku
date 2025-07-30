import { useMemo, useRef, useState } from 'react';
import { SudokuInput } from './components/SudokuInput/SudokuInput';
import { ErrorColor, ValidColor, type Sudoku } from './model/sudoku.model';
import { SudokuValidator, BASE_SUDOKU } from './utils/sudoku.utils';

export default function App() {
  const [sudoku, setSudoku] = useState<Sudoku>(BASE_SUDOKU);

  const inputRefs = useRef<Array<Array<HTMLInputElement | null>>>(
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );

  const registerRef = (r: number, c: number, el: HTMLInputElement | null) => {
    inputRefs.current[r][c] = el;
  };

  const focusCell = (r: number, c: number) => {
    const el = inputRefs.current[r][c];
    el?.focus();
    el?.select();
  };

  const { errors, validBlocksCells } = useMemo(
    () => new SudokuValidator(sudoku).validate(),
    [sudoku]
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex flex-col">
        {sudoku.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="flex flex-row">
              {row.map((value, colIndex) => {
                const cellErrors = errors.filter(e => e.row === rowIndex && e.col === colIndex);

                const cellIsValid = validBlocksCells.some(
                  ([r, c]) => r === rowIndex && c === colIndex
                );
                const blockEColor = cellErrors.find(e => e.color === ErrorColor.Block)?.color;
                const lineEColor = cellErrors.find(e => e.color === ErrorColor.LineCell)?.color;
                const blockCellEColor = cellErrors.find(
                  e => e.color === ErrorColor.BlockCell
                )?.color;

                const cellColor = cellIsValid
                  ? ValidColor.Valid
                  : (blockCellEColor ?? lineEColor ?? blockEColor);

                return (
                  <SudokuInput
                    key={`${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    value={value}
                    setSudoku={setSudoku}
                    cellColor={cellColor}
                    registerRef={registerRef}
                    focusCell={focusCell}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
