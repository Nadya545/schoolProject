import React from "react";
import StudentCard from "./StudentCard";
const CardsContainer = ({
  studentCards,
  inputEvent,
  setInputEvent,
  selectedStudents,
  setSelectedStudents,
  handleMoveStudents,
  handleInput,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleInput();
  };
  return (
    <div className="CardsContainer">
      <form className="inputForm">
        <input
          className="input"
          type="text"
          value={inputEvent}
          onChange={(e) => setInputEvent(e.target.value)}
        />
        <button className="btnInput" onClick={handleSubmit} type="submit">
          Ok
        </button>
      </form>
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
