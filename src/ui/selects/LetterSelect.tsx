import React from "react";
import "./selects.scss";

const LetterSelect = ({ letterSelect, setLetterSelect }) => {
  const letter = ["А", "Б", "В"];
  return (
    <div>
      <select
        className="letterSelect"
        value={letterSelect}
        onChange={(e) => setLetterSelect(e.target.value)}
      >
        <option value="">Выберите букву</option>
        {letter.map((lett, index) => (
          <option key={index} value={lett}>
            {lett}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LetterSelect;
