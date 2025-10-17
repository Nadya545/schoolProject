import React from "react";
import Student from "./Student";
import {
  SelectedStudent,
  Student as StudentType,
} from "../interfaces/interfaces";
const StudentCard = ({
  cardData,
  handleMoveStudents,
  index,
  selectedStudents,
  setSelectedStudents,
}) => {
  const numberClass = cardData.number;
  const cardLetter = cardData.letter;

  return (
    <div className="studentCard">
      <button
        className="btn-here"
        onClick={() => handleMoveStudents(index)}
        disabled={
          selectedStudents.length === 0 ||
          selectedStudents.some((selectedStudent: SelectedStudent) => {
            return (
              selectedStudent.number !== numberClass ||
              selectedStudent.letter === cardLetter
            );
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
      {cardData.students.map((student: StudentType) => (
        <Student
          cardLetter={cardLetter}
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
