import { useMemo, useRef, useState } from 'react';
import { SudokuControls } from './components/SudokuControls/SudokuControls';
import { SudokuInput } from './components/SudokuInput/SudokuInput';
import { type Sudoku } from './model/sudoku.model';
import { BASE_SUDOKU, SudokuValidator } from './utils/sudoku.utils';

export default function App() {
  const [sudoku, setSudoku] = useState<Sudoku>(BASE_SUDOKU);
  const [initialSudoku, setInitialSudoku] = useState<Sudoku>(BASE_SUDOKU);

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

  const { getCellColor } = useMemo(
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
                const isDisabled = initialSudoku[rowIndex][colIndex] != null;

                return (
                  <SudokuInput
                    key={`${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    value={value}
                    isDisabled={isDisabled}
                    setSudoku={setSudoku}
                    cellColor={getCellColor(rowIndex, colIndex)}
                    registerRef={registerRef}
                    focusCell={focusCell}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <SudokuControls
        setSudoku={setSudoku}
        sudoku={sudoku}
        setInitialSudoku={setInitialSudoku}
      />
    </div>
  );
}
