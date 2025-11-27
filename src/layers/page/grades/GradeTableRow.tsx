import React from "react";
import {
  Score,
  useDeleteScoreMutation,
  useUpdateScoreMutation,
} from "../../../store/api/scoresApi";
import { useAppSelector } from "../../../store/hooks";
import Button from "../../../ui/button/Button";
import CorrectScoreModal from "../../../ui/modal/CorrectScoreModal";

interface GradeTableRowProps {
  grade: Score;
  role: "teacher" | "parent" | "student";
  children?: number[];
  reLoadGrades: () => void;
}
const GradeTableRow = ({ grade, role, children, reLoadGrades }) => {
  const studentCards = useAppSelector((state) => state.students.studentCards);

  // 🎯 Используем RTK Query мутации для удаления и обновления оценок
  const [deleteScore, { isLoading: deleteLoading }] = useDeleteScoreMutation();
  const [updateScoreMutation, { isLoading: updateLoading }] =
    useUpdateScoreMutation();

  const student = React.useMemo(() => {
    const allStudents = studentCards.flatMap((card) => card.students);
    return allStudents.find((s) => String(s.id) === String(grade.studentId));
  }, [studentCards, grade.studentId]);

  const isUserChild = React.useMemo(() => {
    if (role !== "parent" || !student || !children) return true;
    return children.includes(Number(student.id));
  }, [role, student, children]);

  const studentName = student
    ? `${student.surname} ${student.name}`
    : `Ученик ID: ${grade.studentId}`;

  const deleteScoreHandler = async () => {
    const isConfirmed = window.confirm(
      "Вы уверены, что хотите удалить эту оценку?"
    );
    if (!isConfirmed) return;

    try {
      await deleteScore(grade.id).unwrap();
      console.log("✅ Оценка удалена через RTK Query");
      reLoadGrades(); // Обновляем список оценок
    } catch (error) {
      console.error("❌ Ошибка удаления оценки:", error);
      alert("Не удалось удалить оценку, попробуйте позже!");
    }
  };

  // 🎯 ОБНОВЛЕНИЕ ОЦЕНКИ ЧЕРЕЗ RTK Query
  const updateScoreHandler = async (updateData: Partial<Score>) => {
    try {
      await updateScoreMutation({
        scoreId: grade.id,
        updatedData: updateData,
      }).unwrap();
      console.log("✅ Оценка обновлена через RTK Query");
      reLoadGrades(); // Обновляем список оценок
    } catch (error) {
      console.error("❌ Ошибка обновления оценки:", error);
      alert("Не удалось отредактировать оценку, попробуйте позже!");
    }
  };

  return (
    <>
      <tr className="grade-table-row">
        <td>{new Date(grade.date).toLocaleDateString()}</td>
        <td>{studentName}</td>
        <td>{grade.subject}</td>
        <td className={`grade-${grade.score}`}>{grade.score}</td>
        <td>{grade.type}</td>
        <td>{grade.comment}</td>

        {role === "teacher" && (
          <td>
            <div className="action-buttons">
              <CorrectScoreModal
                updateScore={updateScoreHandler}
                grade={grade}
              />
              <Button size="addAndOut" onClick={deleteScoreHandler}>
                🗑️
              </Button>
            </div>
          </td>
        )}
      </tr>
    </>
  );
};

export default GradeTableRow;
