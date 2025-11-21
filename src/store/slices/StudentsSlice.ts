import { createSlice } from "@reduxjs/toolkit";
import { SelectedStudent, StudentCard } from "../../types/studentType";
import { cardsStudentsData } from "../../constants/cartStudents";

interface StudentState {
  studentCards: StudentCard[];
  selectedStudents: SelectedStudent[];
}
const initialState: StudentState = {
  studentCards: cardsStudentsData,
  selectedStudents: [],
};

const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    updateStudentCards: (state, action) => {
      state.studentCards = action.payload;
    },
    updateSelectedStudents: (state, action) => {
      state.selectedStudents = action.payload;
    },
    mergeStudentCards: (state, action) => {
      const dbStudentCards = action.payload;

      // Объединяем студентов из константы и БД
      const mergedCards = new Map();

      // Добавляем карточки из константы
      cardsStudentsData.forEach((card) => {
        const key = `${card.number}-${card.letter}`;
        mergedCards.set(key, { ...card });
      });

      // Добавляем/объединяем карточки из БД
      dbStudentCards.forEach((dbCard: StudentCard) => {
        const key = `${dbCard.number}-${dbCard.letter}`;

        if (mergedCards.has(key)) {
          // Если класс уже есть, добавляем студентов (исключая дубликаты)
          const existingCard = mergedCards.get(key);
          const existingStudentIds = new Set(
            existingCard.students.map((s) => s.id)
          );

          dbCard.students.forEach((student) => {
            if (!existingStudentIds.has(student.id)) {
              existingCard.students.push(student);
            }
          });
        } else {
          // Если класса нет, добавляем новую карточку
          mergedCards.set(key, { ...dbCard });
        }
      });

      state.studentCards = Array.from(mergedCards.values());
    },
    addStudent: (state, action) => {
      const { name, surname, class: studentClass, id } = action.payload;

      const number = parseInt(studentClass);
      const letter = studentClass.replace(number.toString(), "");

      const existingCard = state.studentCards.find(
        (card) => card.number === number && card.letter === letter
      );

      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

      // Проверка на дубликаты
      const allStudents = state.studentCards.flatMap((card) => card.students);
      const existingStudent = allStudents.find(
        (student) => student.id.toString() === id.toString()
      );

      if (existingStudent) {
        console.warn("Студент с таким ID уже существует:", id);
        return;
      }

      if (existingCard) {
        const newStudent = {
          id: id,
          name: capitalize(name),
          surname: capitalize(surname),
        };
        existingCard.students.push(newStudent);
      } else {
        const newCard: StudentCard = {
          id,
          number,
          letter,
          students: [
            { id: id, name: capitalize(name), surname: capitalize(surname) },
          ],
        };
        state.studentCards.push(newCard);
      }
    },
  },
});
export const {
  updateStudentCards,
  updateSelectedStudents,
  mergeStudentCards,
  addStudent,
} = studentsSlice.actions;

export default studentsSlice.reducer;
