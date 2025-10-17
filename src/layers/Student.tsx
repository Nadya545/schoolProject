import React from "react";
import { SelectedStudent } from "../interfaces/interfaces";

const Student = ({
  student,
  numberClass,
  selectedStudents,
  setSelectedStudents,
  cardLetter,
}) => {
  const isSelected = selectedStudents.some(
    (selectedStudent: SelectedStudent) => {
      return selectedStudent.id === student.id;
    }
  );

  const handleCheckBox = () => {
    if (isSelected) {
      /*список id и номер класса студентов, если  выбран студент, стоит галка*/
      const filterSelectedStudents = selectedStudents.filter(
        (selectedStudent: SelectedStudent) => {
          return selectedStudent.id !== student.id;
        }
      );
      setSelectedStudents(filterSelectedStudents);
    } else {
      setSelectedStudents([
        ...selectedStudents,
        {
          id: student.id,
          number: numberClass,
          letter: cardLetter,
        },
      ]);
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
