import React from "react";

const InputSurname = ({ inputEventSurname, setInputEventSurname }) => {
  return (
    <div>
      {" "}
      <form className="inputForm">
        <input
          className="input2"
          type="text"
          value={inputEventSurname}
          onChange={(e) => setInputEventSurname(e.target.value)}
          placeholder="Введите фамилию ученика..."
        />
      </form>
    </div>
  );
};

export default InputSurname;
