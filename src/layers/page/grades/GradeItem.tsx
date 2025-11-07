import React from "react";
import { Score, api } from "../../../services/api";
import { useAppSelector } from "../../../store/hooks";
interface GradeItemProps {
  grade: Score;
  role: "teacher" | "parent" | "student";
  id?: number | undefined;
  children: number[] | undefined;
}
const GradeItem: React.FC<GradeItemProps> = ({ grade, role, id, children }) => {
  const studentCards = useAppSelector((state) => state.students.studentCards);

  const myChildrenStudents = studentCards.flatMap((card) => {
    return card.students.filter((student) => children?.includes(student.id));
  });
  const currentChild = myChildrenStudents.find((child) => {
    return child.id === grade.studentId;
  });

  return (
    <div className="grade-item">
      {role === "parent" && currentChild && (
        <div>
          {currentChild.name} {currentChild.surname}
        </div>
      )}

      <div>
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
