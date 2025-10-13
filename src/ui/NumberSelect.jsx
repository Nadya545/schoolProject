import React from "react";

const NumberSelect = ({ numberSelect, setNumberSelect }) => {
  const number = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <div>
      <select
        className="numberSelect"
        value={numberSelect}
        onChange={(e) => setNumberSelect(e.target.value)}
      >
        <option value="">Выберите номер</option>
        {number.map((num, index) => (
          <option key={index} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NumberSelect;
