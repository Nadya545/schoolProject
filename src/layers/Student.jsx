import React from "react";

const Student = ({
  student,
  numberClass,
  selectedStudents,
  setSelectedStudents,
}) => {
  const isSelected = selectedStudents.some((selectedStudent) => {
    return selectedStudent.id === student.id;
  });

  const handleCheckBox = () => {
    if (isSelected) {
      /*список id и номер класса студентов, если  выбран студент, стоит галка*/
      const filterSelectedStudents = selectedStudents.filter(
        (selectedStudent) => {
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
