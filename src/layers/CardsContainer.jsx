import React from "react";
import StudentCard from "./StudentCard";
import Modal from "./Modal";
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
      <Modal
        handleSubmit={handleSubmit}
        inputEventName={inputEventName}
        setInputEventName={setInputEventName}
        inputEventSurname={inputEventSurname}
        setInputEventSurname={setInputEventSurname}
        numberSelect={numberSelect}
        setNumberSelect={setNumberSelect}
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
