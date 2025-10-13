import React from "react";
import Student from "./Student";
const StudentCard = ({
  cardData,

  handleMoveStudents,
  index,
  selectedStudents,
  setSelectedStudents,
}) => {
  const numberClass = cardData.number;
  return (
    <div className="studentCard">
      <button
        className="btn-here"
        onClick={() => handleMoveStudents(index)}
        disabled={
          selectedStudents.length === 0 ||
          selectedStudents.some((selectedStudent) => {
            return selectedStudent.number !== numberClass; // проверь эту логику!
          })
        }
      >
        Переместить сюда
      </button>
      <div className="class">
        {" "}
        {cardData.number}
        {cardData.letter}
      </div>
      {cardData.students.map((student) => (
        <Student
          numberClass={numberClass}
          student={student}
          key={student.id}
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
        />
      ))}
    </div>
  );
};

export default StudentCard;
