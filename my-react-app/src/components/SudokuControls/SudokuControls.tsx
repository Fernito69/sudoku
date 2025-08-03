import { deleteSudoku, getSudokus, saveSudoku } from '@/data/sudoku.service';
import type { DbSudoku, Sudoku, SudokuValue } from '@/model/sudoku.model';
import { BASE_SUDOKU, SudokuSolver, copy } from '@/utils/sudoku.utils';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button } from '../ui/button';

interface Props {
  setSudoku: React.Dispatch<React.SetStateAction<Sudoku>>;
  sudoku: Sudoku;
  setInitialSudoku: React.Dispatch<React.SetStateAction<Sudoku>>;
}
type Option = {
  value: Sudoku;
  label: string;
} | null;

export function SudokuControls({ setSudoku, sudoku, setInitialSudoku }: Props) {
  const [sudokuList, setSudokuList] = useState<DbSudoku[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option>(null);

  useEffect(() => {
    updateList();
  }, []);

  const updateList = () => {
    setSudokuList(getSudokus());
  };

  const onChange = (option: Option) => {
    setSelectedOption(option);
    const newSudoku = option?.value ?? BASE_SUDOKU;
    setSudoku(newSudoku);
    setInitialSudoku(newSudoku);
  };

  const handleSave = () => {
    const name = saveSudoku(sudoku);
    if (!name) return;
    const newOption = { value: sudoku, label: name };
    setSelectedOption(newOption);
    setSudoku(sudoku);
    setInitialSudoku(sudoku);
    updateList();
  };

  const handleSaveFromString = () => {
    const sudokuStr = window.prompt('Enter a Sudoku string:');
    // Check with regex that it only contains numbers from 0 to 9
    if (!sudokuStr || !sudokuStr.match(/^[0-9]{81}$/))
      return alert('Invalid input');

    let sudoku = copy(BASE_SUDOKU);
    for (let i = 0; i < 81; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      const value = sudokuStr[i];
      if (value === '.') continue;
      sudoku[row][col] =
        value === '0' ? undefined : (Number(value) as SudokuValue);
    }

    const name = saveSudoku(sudoku);
    if (!name) return;
    const newOption = { value: sudoku, label: name };
    setSelectedOption(newOption);
    setSudoku(sudoku);
    setInitialSudoku(sudoku);
    updateList();
  };

  const handleDelete = () => {
    setSudoku(BASE_SUDOKU);
    deleteSudoku(selectedOption?.label ?? '');
    setSelectedOption(null);
    updateList();
  };

  const handleReset = () => {
    const initial = selectedOption?.value ?? BASE_SUDOKU;
    setSudoku(initial);
    setInitialSudoku(initial);
    setSelectedOption(selectedOption);
  };

  const handleSolve = () => {
    setSudoku(new SudokuSolver(sudoku).solve());
  };

  const options = sudokuList.map(s => ({ value: s.sudoku, label: s.key }));

  return (
    <div className="flex flex-row items-center mt-2 py-2 px-2 bg-gray-300 gap-2 border border-gray-300 rounded w-fit">
      <Button onClick={handleReset}>Reset</Button>
      <Button className="bg-green-600 hover:bg-green-700" onClick={handleSolve}>
        Solve
      </Button>
      <Select
        className="w-64"
        options={options}
        onChange={onChange}
        isClearable
        value={selectedOption}
        menuPortalTarget={document.body}
        isDisabled={sudokuList.length === 0}
        placeholder="Select a saved sudoku"
      />
      <Button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSave}
      >
        Save
      </Button>
      <Button
        className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSaveFromString}
      >
        Import
      </Button>
      <Button
        size={'icon'}
        className="border border-red-300 bg-red-300"
        onClick={handleDelete}
        disabled={sudokuList.length === 0 || selectedOption === null}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
}
