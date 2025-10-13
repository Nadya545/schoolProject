import React from "react";

const InputName = ({ inputEventName, setInputEventName, handleSubmit }) => {
  return (
    <div>
      <form className="inputForm">
        <input
          className="input"
          type="text"
          value={inputEventName}
          onChange={(e) => setInputEventName(e.target.value)}
          placeholder="Введите имя ученика..."
        />
        <button className="btnInput" onClick={handleSubmit} type="submit">
          Ok
        </button>
      </form>
    </div>
  );
};

export default InputName;
