import React from "react";
import StudentCard from "./StudentCard";
import NumberSelect from "../ui/NumberSelect";
import LetterSelect from "../ui/LetterSelect";
import InputName from "../ui/InputName";
import InputSurname from "../ui/InputSurname";
const CardsContainer = ({
  studentCards,
  inputEventName,
  setInputEventName,
  inputEventSurname,
  setInputEventSurname,
  selectedStudents,
  setSelectedStudents,
  handleMoveStudents,
  handleClickBtn,
  numberSelect,
  setNumberSelect,
  letterSelect,
  setLetterSelect,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleClickBtn(
      inputEventName,
      inputEventSurname,
      numberSelect,
      letterSelect
    );
  };
  return (
    <div className="CardsContainer">
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
      {studentCards.map((cardData, index) => (
        <StudentCard
          handleMoveStudents={handleMoveStudents}
          cardData={cardData}
          key={cardData.id}
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
          index={index}
        />
      ))}
    </div>
  );
};

export default CardsContainer;
