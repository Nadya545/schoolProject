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
          id: Date.now(),
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
export const { updateStudentCards, updateSelectedStudents, addStudent } =
  studentsSlice.actions;

export default studentsSlice.reducer;
