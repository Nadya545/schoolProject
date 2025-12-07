import { Score } from "../../../store/api/scoresApi";
import { User } from "../../../store/api/usersApi";
import { Student } from "../../../types/studentType";

export const getFilteredGrades = (
  currentUser: User,
  allScores: Score[],
  studentsOfSelectedClass: Student[]
) => {
  if (!currentUser || !allScores || allScores.length === 0) {
    return [];
  }
  let filteredGrades: Score[] = [];
  if (currentUser.role === "student") {
    // Оценки текущего студента
    filteredGrades = allScores.filter(
      (score) => score.studentId?.toString() === currentUser.id?.toString()
    );
  } else if (currentUser.role === "parent") {
    // Оценки детей родителя
    const childrenIds = (currentUser.children || []).map(String);
    filteredGrades = allScores.filter((score) =>
      childrenIds.includes(score.studentId?.toString() || "")
    );
  } else if (currentUser.role === "teacher") {
    // Оценки по предмету учителя для выбранных студентов
    const studentIds = studentsOfSelectedClass.map((student) =>
      student.id.toString()
    );
    filteredGrades = allScores.filter(
      (score) =>
        score.subject === currentUser.subject &&
        studentIds.includes(score.studentId?.toString() || "")
    );
  }
  return filteredGrades;
};
