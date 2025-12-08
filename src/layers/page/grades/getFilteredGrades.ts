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

  const normalizeId = (id: any): string => {
    if (id === null || id === undefined) return "";
    return String(id);
  };

  if (currentUser.role === "student") {
    // Оценки текущего студента
    const currentUserId = normalizeId(currentUser.id);
    filteredGrades = allScores.filter(
      (score) => normalizeId(score.studentId) === currentUserId
    );
  } else if (currentUser.role === "parent") {
    // Оценки детей родителя
    const childrenIds = (currentUser.children || []).map((childId) =>
      normalizeId(childId)
    );

    filteredGrades = allScores.filter((score) =>
      childrenIds.includes(normalizeId(score.studentId))
    );
  } else if (currentUser.role === "teacher") {
    // Оценки по предмету учителя для выбранных студентов
    const studentIds = studentsOfSelectedClass.map((student) =>
      normalizeId(student.id)
    );

    filteredGrades = allScores.filter(
      (score) =>
        score.subject === currentUser.subject &&
        studentIds.includes(normalizeId(score.studentId))
    );
  }
  return filteredGrades;
};
