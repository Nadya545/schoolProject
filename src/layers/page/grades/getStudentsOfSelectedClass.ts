import { Student, StudentCard } from "../../../types/studentType";

export const getStudentsOfSelectedClass = (
  selectedClass: string,
  studentCardsRedux: StudentCard[]
) => {
  //Кого показывать, каких именно студентов?
  let studentsOfSelectedClass: Student[] = [];
  if (!selectedClass) {
    // Все студенты всех классов
    studentsOfSelectedClass = studentCardsRedux.flatMap(
      (card) => card.students || []
    );
  } else {
    // Студенты выбранного класса
    const card = studentCardsRedux.find(
      (card) => `${card.number}${card.letter}` === selectedClass
    );
    studentsOfSelectedClass = card?.students || [];
  }
  return studentsOfSelectedClass;
};
