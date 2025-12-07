import React from "react";
import { useModal } from "../../hooks/useModal";
import Button from "../button/Button";
import Modal from "./Modal";
import Input from "../input/Input";
import Select from "../selects/Select";
import "./style.scss";
import { AddStudentModalProps } from "./typeModal/typeModal";

const AddStudentModal = ({
  handleSubmit,
  inputEventName,
  inputEventSurname,
  numberSelect,
  letterSelect,
  setInputEventName,
  setInputEventSurname,
  setNumberSelect,
  setLetterSelect,
}: AddStudentModalProps) => {
  const { isOpen, onOpen, onClose } = useModal();
  console.log("isOpen:", isOpen);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
    onClose();
  };

  const numberOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const letterOptions = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"];

  return (
    <div>
      <Button size="addAndOut" className="btn-modal" onClick={onOpen}>
        Добавить ученика
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="modal-body">
          <form className="inputForm" onSubmit={handleFormSubmit}>
            <Input
              inputSize="normal"
              className="input"
              type="text"
              value={inputEventName}
              onChange={(e) => setInputEventName(e.target.value)}
              placeholder="Введите имя ученика..."
            />

            <Input
              inputSize="normal"
              className="input2"
              type="text"
              value={inputEventSurname}
              onChange={(e) => setInputEventSurname(e.target.value)}
              placeholder="Введите фамилию ученика..."
            />

            {/* Селект для номера класса */}
            <Select
              value={numberSelect}
              onChange={(e) => setNumberSelect(Number(e.target.value))}
              placeholder="Выберите номер класса"
            >
              <option value="">Выберите номер</option>
              {numberOptions.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </Select>

            {/* Селект для буквы класса */}
            <Select
              value={letterSelect}
              onChange={(e) => setLetterSelect(e.target.value)}
              placeholder="Выберите букву класса"
            >
              <option value="">Выберите букву</option>
              {letterOptions.map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </Select>

            <Button size="normal" type="submit">
              Ok
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AddStudentModal;
