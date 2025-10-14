import React, { useState } from "react";
import InputName from "../ui/InputName";
import InputSurname from "../ui/InputSurname";
import NumberSelect from "../ui/NumberSelect";
import LetterSelect from "../ui/LetterSelect";
const Modal = ({
  handleSubmit,
  inputEventName,
  setInputEventName,
  inputEventSurname,
  setInputEventSurname,
  numberSelect,
  setNumberSelect,
  letterSelect,
  setLetterSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="modal">
      <button onClick={openModal}>Добавить ученика</button>
      {isOpen === true && (
        <div className="modal-open">
          <InputName
            handleSubmit={handleSubmit}
            inputEventName={inputEventName}
            setInputEventName={setInputEventName}
          />
          <InputSurname
            inputEventSurname={inputEventSurname}
            setInputEventSurname={setInputEventSurname}
          />
          <NumberSelect
            numberSelect={numberSelect}
            setNumberSelect={setNumberSelect}
          />
          <LetterSelect
            letterSelect={letterSelect}
            setLetterSelect={setLetterSelect}
          />
          <button onClick={closeModal} className="modal-close">
            Закрыть{" "}
          </button>
        </div>
      )}
    </div>
  );
};

export default Modal;
