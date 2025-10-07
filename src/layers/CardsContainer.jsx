import React from "react";
import StudentCard from "./StudentCard";
const CardsContainer = ({
  studentCards,
  inputEvent,
  setInputEvent,
  selectedStudents,
  setSelectedStudents,

  handleMoveStudents,
}) => {
  return (
    <div className="CardsContainer">
      <div className="inputForm">
        <input className="input" type="text" />
        <button className="btnInput">Ok</button>
      </div>
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
