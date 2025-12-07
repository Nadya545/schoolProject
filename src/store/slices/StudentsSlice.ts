import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
    updateStudentCards: (state, action: PayloadAction<StudentCard[]>) => {
      state.studentCards = action.payload;
    },

    updateSelectedStudents: (
      state,
      action: PayloadAction<SelectedStudent[]>
    ) => {
      state.selectedStudents = action.payload;
    },

    // 🔄 ОБНОВЛЕННЫЙ: Добавляет студента и возвращает данные для БД
    addStudent: (
      state,
      action: PayloadAction<{
        name: string;
        surname: string;
        class: string;
        id?: string;
        onStudentAdded?: (studentData: any) => void; // Колбэк для создания в БД
      }>
    ) => {
      const {
        name,
        surname,
        class: studentClass,
        onStudentAdded,
      } = action.payload;
      const number = parseInt(studentClass);
      const letter = studentClass.replace(number.toString(), "");

      // Генерируем ID и логин/пароль
      const id = Date.now().toString();
      const login = `${name.toLowerCase()}${surname.toLowerCase()}${number}${letter}`;
      const password = "12345"; // Стандартный пароль

      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

      // Проверка на дубликаты
      const allStudents = state.studentCards.flatMap((card) => card.students);
      const existingStudent = allStudents.find(
        (student) =>
          student.name.toLowerCase() === name.toLowerCase() &&
          student.surname.toLowerCase() === surname.toLowerCase()
      );

      if (existingStudent) {
        console.warn("Студент с таким именем и фамилией уже существует:");
        return;
      }

      const newStudentData = {
        id,
        name: capitalize(name),
        surname: capitalize(surname),
        login,
        password,
        class: studentClass,
        role: "student" as const,
      };

      // Добавляем в Redux
      const existingCard = state.studentCards.find(
        (card) => card.number === number && card.letter === letter
      );

      if (existingCard) {
        existingCard.students.push({
          id,
          name: capitalize(name),
          surname: capitalize(surname),
        });
      } else {
        const newCard: StudentCard = {
          id: `class-${number}-${letter}`,
          number,
          letter,
          students: [
            { id, name: capitalize(name), surname: capitalize(surname) },
          ],
        };
        state.studentCards.push(newCard);
      }

      // Вызываем колбэк для создания в БД
      if (onStudentAdded) {
        onStudentAdded(newStudentData);
      }
    },
  },
});

export const { updateStudentCards, updateSelectedStudents, addStudent } =
  studentsSlice.actions;

export default studentsSlice.reducer;
