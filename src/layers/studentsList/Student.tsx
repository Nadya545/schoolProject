import React from "react";
import { SelectedStudent } from "../../types/studentType";
import {
  updateSelectedStudents,
  updateStudentCards,
} from "../../store/slices/studentsSlice";

const Student = ({
  student,
  numberClass,
  cardLetter,
  selectedStudents,
  dispatch,
}) => {
  const isSelected = selectedStudents.some(
    (selectedStudent: SelectedStudent) => {
      return selectedStudent.id === student.id;
    }
  );

  const handleCheckBox = () => {
    if (isSelected) {
      /*список id и номер класса студентов, если  выбран студент, стоит галка*/
      dispatch(
        updateSelectedStudents(
          selectedStudents.filter((selectedStudent: SelectedStudent) => {
            return selectedStudent.id !== student.id;
          })
        )
      );
    } else {
      dispatch(
        updateSelectedStudents([
          ...selectedStudents,
          {
            id: student.id,
            number: numberClass,
            letter: cardLetter,
          },
        ])
      );
    }
  };

  return (
    <div className="student">
      <label className="checkbox">
        <input
          type="checkbox"
          onChange={handleCheckBox}
          checked={isSelected} //"Отмечайся галочкой или нет, в зависимости от переменной от условия"
        />

        <span className="checkmark">
          {student.id}.{student.name}
          {student.surname}
        </span>
      </label>
    </div>
  );
};

export default Student;
