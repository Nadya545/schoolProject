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
      const { name, surname, class: studentClass } = action.payload;

      const number = parseInt(studentClass);
      const letter = studentClass.replace(number.toString(), "");

      const existingCard = state.studentCards.find(
        (card) => card.number === number && card.letter === letter
      );

      const getIdStudent = () => {
        const idStudents = state.studentCards.flatMap((card) => {
          return card.students;
        });

        const returnId = idStudents.map((el) => {
          return el.id;
        });

        const idsArr = returnId;
        if (idsArr.length !== 0) {
          const maxId = Math.max(...idsArr);
          const newId = maxId + 1;
          return newId;
        } else {
          return 1;
        }
      };
      const newId = getIdStudent();
      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

      if (existingCard) {
        const newStudent = {
          id: newId,
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
            { id: newId, name: capitalize(name), surname: capitalize(surname) },
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
