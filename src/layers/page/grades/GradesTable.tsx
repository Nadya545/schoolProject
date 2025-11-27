import React from "react";
import { Score } from "../../../store/api/scoresApi";
import GradeTableRow from "./GradeTableRow";

interface GradesTableProps {
  grades: Score[];
  children: number[];
  role: "teacher" | "parent" | "student";
  reLoadGrades: () => void;
}

const GradesTable: React.FC<GradesTableProps> = ({
  grades,
  children,
  role,
  reLoadGrades,
}) => {
  return (
    <div className="grades-table">
      <table className="table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Ученик</th>
            <th>Предмет</th>
            <th>Оценка</th>
            <th>Тип работы</th>
            <th>Комментарий</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => (
            <GradeTableRow
              key={grade.id}
              grade={grade}
              role={role}
              children={children}
              reLoadGrades={reLoadGrades}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradesTable;
