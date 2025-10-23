import { createSlice } from "@reduxjs/toolkit";
import { SelectedStudent, StudentCard } from "../../types/studentType";
import { cardsStudentsData } from "../../constants/CartStudents";

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
  },
});

export const { updateStudentCards, updateSelectedStudents } =
  studentsSlice.actions;

export default studentsSlice.reducer;
