import React from "react";
import { Score, api } from "../../../services/api";
import { useAppSelector } from "../../../store/hooks";
import Button from "../../../ui/button/Button";

interface GradeItemProps {
  grade: Score;
  role: "teacher" | "parent" | "student";
  id?: number | undefined;
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

  const myChildrenStudents = studentCards.flatMap((card) => {
    return card.students.filter((student) => children?.includes(student.id));
  });
  const currentChild = myChildrenStudents.find((child) => {
    return child.id === grade.studentId;
  });

  const deleteScore = async () => {
    console.log("🔍 ID оценки:", grade.id);
    console.log("🔍 ID как строка:", grade.id.toString());
    console.log("🔍 Тип ID:", typeof grade.id);
    const isConfirmed = window.confirm(
      "Вы уверены, что хотите удалить эту оценку?"
    );
    if (!isConfirmed) return;
    try {
      await api.deleteScore(grade.id);
      loadGrades();
    } catch (error) {
      alert("Не удалось удалить оценку, попробуйте позже!");
    }
  };

  /* const updateScore= async()=>{
    try {
      await api.updateScore(grade.id, );
      loadGrades()
    } catch (error) {
      alert("Не удалось отредактировать оценку, попробуйте позже!");
    }
  }*/

  return (
    <div className="grade-item">
      {role === "parent" && currentChild && (
        <div className="gradesForParent">
          {currentChild.name} {currentChild.surname}
        </div>
      )}
      {role === "teacher" && (
        <>
          <Button size="normal">Редактировать</Button>
          <Button size="normal" onClick={deleteScore}>
            Удалить
          </Button>
        </>
      )}

      <div className="gradesForEveryone">
        <div>{new Date(grade.date).toLocaleDateString()}</div>
        <div>📚 {grade.subject}</div>
        <div>⭐ {grade.score}</div>
        <div>📝 {grade.type}</div>
        <div>{grade.comment}</div>
      </div>
    </div>
  );
};

export default GradeItem;
