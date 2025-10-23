import React from "react";
import Student from "./Student";
import {
  SelectedStudent,
  Student as StudentType,
} from "../../types/studentType";
import Button from "../../ui/button/Button";
const StudentCard = ({
  dispatch,
  cardData,
  index,
  handleMoveStudents,
  selectedStudents,
}) => {
  const numberClass = cardData.number;
  const cardLetter = cardData.letter;

  return (
    <div className="studentCard">
      <Button
        size="normal"
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
      </Button>
      <div className="class">
        {" "}
        {cardData.number}
        {cardData.letter}
      </div>
      {cardData.students.map((student: StudentType) => (
        <Student
          dispatch={dispatch}
          cardLetter={cardLetter}
          numberClass={numberClass}
          student={student}
          key={student.id}
          selectedStudents={selectedStudents}
        />
      ))}
    </div>
  );
};

export default StudentCard;
