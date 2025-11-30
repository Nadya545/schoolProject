import React, { useState } from "react";
import {
  Score,
  useDeleteScoreMutation,
  useUpdateScoreMutation,
} from "../../../store/api/scoresApi";
import Button from "../../../ui/button/Button";
import { Student } from "../../../types/studentType";
import CorrectScoreModal from "../../../ui/modal/CorrectScoreModal";

interface GradeTableRowProps {
  grade: Score;
  role: "teacher" | "parent" | "student";
  children?: number[];
  student: Student;
  reLoadGrades: () => void;
  loadGrades: () => void;
}

const GradeTableRow: React.FC<GradeTableRowProps> = ({
  grade,
  role,
  reLoadGrades,
  loadGrades,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteScore] = useDeleteScoreMutation();
  const [updateScoreMutation] = useUpdateScoreMutation();

  const deleteScoreHandler = async () => {
    const isConfirmed = window.confirm("Удалить эту оценку?");
    if (!isConfirmed) return;

    try {
      await deleteScore(grade.id).unwrap();
      reLoadGrades();
    } catch (error) {
      alert("Не удалось удалить оценку!");
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
      setShowModal(false);
    } catch (error) {
      console.error("❌ Ошибка обновления оценки:", error);
      alert("Не удалось отредактировать оценку, попробуйте позже!");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <div
        className="compact-grade"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <span className={`grade-badge grade-${grade.score}`}>
          {grade.score}
        </span>

        {role === "teacher" && showActions && (
          <div className="compact-actions">
            <Button size="addAndOut" onClick={handleOpenModal}>
              ✏️
            </Button>

            <Button size="addAndOut" onClick={deleteScoreHandler}>
              🗑️
            </Button>
          </div>
        )}
      </div>
      <CorrectScoreModal
        updateScoreHandler={updateScoreHandler}
        grade={grade}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default GradeTableRow;
