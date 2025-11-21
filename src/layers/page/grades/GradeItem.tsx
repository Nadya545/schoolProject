import React, { useState } from "react";
import { api } from "../../../services/api";
import { apiForScore, Score } from "../../../services/apiForScore";
import { useAppSelector } from "../../../store/hooks";
import Button from "../../../ui/button/Button";
import CorrectScoreModal from "../../../ui/modal/CorrectScoreModal";
import { Student } from "../../../types/studentType";

interface GradeItemProps {
  grade: Score;
  role: "teacher" | "parent" | "student";
  id?: string;
  children: number[] | undefined;
  loadGrades: () => void;
}
const GradeItem: React.FC<GradeItemProps> = ({
  grade,
  role,
  children,
  loadGrades,
}) => {
  const studentCards = useAppSelector((state) => state.students.studentCards);
  const student = studentCards
    .flatMap((card) => card.students)
    .find((s) => s.id.toString() === grade.studentId);

  const myChildrenStudents = studentCards.flatMap((card) => {
    return card.students.filter((student) => children?.includes(student.id));
  });
  const currentChild = myChildrenStudents.find((child) => {
    if (!grade.studentId) return false;
    return child.id === Number(grade.studentId);
  });

  const deleteScore = async () => {
    const isConfirmed = window.confirm(
      "Вы уверены, что хотите удалить эту оценку?"
    );
    if (!isConfirmed) return;
    try {
      await apiForScore.deleteScore(grade.id);
      loadGrades();
    } catch (error) {
      alert("Не удалось удалить оценку, попробуйте позже!");
    }
  };

  const updateScore = async (updateData: Partial<Score>) => {
    try {
      await apiForScore.updateScore(grade.id, updateData);
      loadGrades();
    } catch (error) {
      alert("Не удалось отредактировать оценку, попробуйте позже!");
    }
  };

  return (
    <div className="grade-item">
      {role === "parent" && currentChild && (
        <div className="gradesForParent">
          {currentChild.name} {currentChild.surname}
        </div>
      )}
      {role === "teacher" && (
        <>
          <CorrectScoreModal updateScore={updateScore} grade={grade} />
          <Button size="normal" onClick={deleteScore}>
            Удалить
          </Button>
        </>
      )}

      <div className="gradesForEveryone">
        <div>{new Date(grade.date).toLocaleDateString()}</div>

        <div>
          {" "}
          👨‍🎓{student?.name} {student?.surname}
        </div>

        <div>📚 {grade.subject}</div>
        <div>⭐ {grade.score}</div>
        <div>📝 {grade.type}</div>
        <div>{grade.comment}</div>
      </div>
    </div>
  );
};

export default GradeItem;
