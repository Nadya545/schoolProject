import React from "react";
import { Score } from "../../../store/api/scoresApi";
import GradeTableRow from "./GradeTableRow";
import { Student } from "../../../types/studentType";

interface GradesTableProps {
  grades: Score[];
  children: number[];
  role: "teacher" | "parent" | "student";
  selectedClass: string;
  subject: string;
  students: Student[];
  reLoadGrades: () => void;
  loadGrades: () => void;
}

const GradesTable: React.FC<GradesTableProps> = ({
  grades,
  children,
  role,
  reLoadGrades,
  loadGrades,
  selectedClass,
  subject,
  students,
}) => {
  if (!students || students.length === 0) {
    return (
      <div className="grades-table">
        <div className="no-students">Нет студентов для отображения</div>
      </div>
    );
  }

  // 🔥 УБИРАЕМ useMemo - ПРОСТЫЕ ВЫЧИСЛЕНИЯ
  const validGrades = grades.filter((grade) => grade.date && grade.studentId);
  const allDates = [...new Set(validGrades.map((grade) => grade.date!))].sort();

  // 🔥 ПРОСТАЯ ГРУППИРОВКА БЕЗ МЕМОИЗАЦИИ
  const gradesByDateAndStudent: {
    [date: string]: { [studentId: string]: Score };
  } = {};

  // Инициализируем объект для всех дат
  allDates.forEach((date) => {
    gradesByDateAndStudent[date] = {};
  });

  // Заполняем оценки
  validGrades.forEach((grade) => {
    const studentId = String(grade.studentId!);
    gradesByDateAndStudent[grade.date!][studentId] = grade;
  });

  // 🔥 ФОРМАТИРОВАНИЕ ДАТ БЕЗ useMemo
  const formattedDates = allDates.map((date) => {
    const dateObj = new Date(date);
    return {
      fullDate: date,
      day: dateObj.getDate(),
      month: dateObj.toLocaleDateString("ru", { month: "short" }),
    };
  });

  // 🔥 ЗАЩИТА ОТ ПУСТЫХ ДАННЫХ
  if (!students || students.length === 0) {
    return (
      <div className="grades-table">
        <div className="no-students">Нет студентов для отображения</div>
      </div>
    );
  }

  if (validGrades.length === 0) {
    return (
      <div className="grades-table">
        <div className="no-grades">Нет оценок для отображения</div>
      </div>
    );
  }

  return (
    <div className="grades-table journal-view">
      <div className="journal-header">
        <h2>
          ЖУРНАЛ ОЦЕНОК - {selectedClass} ({subject})
        </h2>
      </div>
      <div className="table-container">
        <table className="table journal-table">
          <thead>
            <tr>
              <th rowSpan={2} className="student-column">
                Ученики
              </th>
              <th colSpan={allDates.length || 1} className="dates-header">
                Даты
              </th>
            </tr>

            <tr>
              {formattedDates.map(({ fullDate, day, month }) => (
                <th key={`date-${fullDate}`} className="date-header">
                  <div className="date-day">{day}</div>
                  <div className="date-month">{month}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={`student-${student.id}`} className="student-row">
                <td className="student-name">
                  {student.surname} {student.name}
                </td>

                {allDates.map((date) => {
                  const grade = gradesByDateAndStudent[date]?.[student.id];
                  return (
                    <td
                      key={`grade-${student.id}-${date}`}
                      className="grade-cell"
                    >
                      {grade ? (
                        <GradeTableRow
                          grade={grade}
                          role={role}
                          children={children}
                          reLoadGrades={reLoadGrades}
                          loadGrades={loadGrades}
                          student={student}
                        />
                      ) : (
                        <span className="no-grade">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesTable;
