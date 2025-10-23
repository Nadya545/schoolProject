import React from "react";
import { useModal } from "../../hooks/useModal";
import Button from "../button/Button";
import Modal from "./Modal";
import Input from "../input/Input";
import NumberSelect from "../selects/NumberSelect";
import LetterSelect from "../selects/LetterSelect";
import "./style.scss";

interface AddStudentModalProps {
  inputEventName: string;
  inputEventSurname: string;
  numberSelect: number;
  letterSelect: string;
  handleSubmit: (e: React.FormEvent) => void;
  setInputEventName: (value: string) => void;
  setInputEventSurname: (value: string) => void;
  setNumberSelect: (value: number) => void;
  setLetterSelect: (value: string) => void;
}
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

            <NumberSelect
              numberSelect={numberSelect}
              setNumberSelect={setNumberSelect}
            />
            <LetterSelect
              letterSelect={letterSelect}
              setLetterSelect={setLetterSelect}
            />
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
