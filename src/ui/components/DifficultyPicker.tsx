import { difficultyLabels, type DifficultyId } from "../../app/model";

interface DifficultyPickerProps {
  selectedDifficulty: DifficultyId;
  onSelectDifficulty: (difficulty: DifficultyId) => void;
}

export function DifficultyPicker({
  selectedDifficulty,
  onSelectDifficulty,
}: DifficultyPickerProps) {
  return (
    <fieldset className="difficulty-picker">
      <legend>难度选择</legend>
      <div className="difficulty-options">
        {Object.entries(difficultyLabels).map(([difficulty, label]) => {
          const id = `difficulty-${difficulty}`;

          return (
            <label
              key={difficulty}
              className="difficulty-option"
              data-selected={selectedDifficulty === difficulty}
              htmlFor={id}
            >
              <input
                checked={selectedDifficulty === difficulty}
                id={id}
                name="difficulty"
                onChange={() => onSelectDifficulty(difficulty as DifficultyId)}
                type="radio"
                value={difficulty}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
