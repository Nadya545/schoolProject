import React from "react";
import { Score } from "../../../store/api/scoresApi";
import "./gradesForStudent.scss";
import { User } from "../../../store/api/usersApi";

interface GradeTableParentProps {
  parentData: User;
  childGrades: Score[];
  selectedChild?: string;
}

const GradesTableParent: React.FC<GradeTableParentProps> = ({
  parentData,
  childGrades,
  selectedChild,
}) => {
  const isSingleChild = selectedChild && selectedChild !== "";
  // Группируем оценки по детям
  const gradesByChild = React.useMemo(() => {
    const groups: Record<string, { childId: string; grades: Score[] }> = {};

    childGrades.forEach((grade) => {
      const childId = String(grade.studentId || "");
      if (!groups[childId]) {
        groups[childId] = { childId, grades: [] };
      }
      groups[childId].grades.push(grade);
    });

    return groups;
  }, [childGrades]);
  const validGrades = childGrades
    .filter((grade) => grade.date && grade.subject && grade.score)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const allSubject = [
    ...new Set(validGrades.map((grade) => grade.subject!)),
  ].sort();

  const allDates = [...new Set(validGrades.map((grade) => grade.date!))].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const gradesByDateAndSubject: {
    [subject: string]: { [date: string]: Score };
  } = {};

  allSubject.forEach((sub) => {
    gradesByDateAndSubject[sub] = {};
  });
  validGrades.forEach((grade) => {
    const subject = String(grade.subject!);
    const date = grade.date!;
    gradesByDateAndSubject[subject][date] = grade;
  });

  const formattedDates = allDates.map((date) => {
    const dateObj = new Date(date);
    return {
      fullDate: date,
      day: dateObj.getDate(),
      month: dateObj.toLocaleDateString("ru", { month: "short" }),
    };
  });

  if (validGrades.length === 0) {
    return (
      <div className="student-grades-table">
        <div className="no-grades">📝 У вас пока нет оценок</div>
      </div>
    );
  }
  return (
    <div>
      <div className="student-grades-table">
        <div className="student-info">
          <h2>
            {" "}
            {selectedChild
              ? `Оценки выбранного ребенка`
              : `Оценки всех детей (${
                  Object.keys(gradesByChild).length
                } детей)`}
          </h2>
          {/* Информация о детях */}
          <div className="children-info">
            {Object.keys(gradesByChild).map((childId) => (
              <div key={childId} className="child-item">
                Ребенок ID: {childId} - оценок:{" "}
                {gradesByChild[childId].grades.length}
              </div>
            ))}
          </div>
          <div className="table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th className="subject-column">Предметы</th>
                  {formattedDates.map(({ fullDate, day, month }) => (
                    <th key={`date-${fullDate}`} className="date-header">
                      <div className="date-day">{day}</div>
                      <div className="date-month">{month}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSubject.map((subject) => (
                  <tr key={`subject-${subject}`} className="subject-row">
                    <td className="subject-name">{subject}</td>
                    {allDates.map((date) => {
                      const grade = gradesByDateAndSubject[subject]?.[date];
                      return (
                        <td
                          key={`grade-${subject}-${date}`}
                          className="grade-cell"
                        >
                          {grade ? (
                            <div className="compact-grade">
                              <span
                                className={`grade-badge grade-${grade.score}`}
                              >
                                {grade.score}
                              </span>
                              {grade.type && (
                                <div className="grade-type">{grade.type}</div>
                              )}
                            </div>
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
      </div>
    </div>
  );
};

export default GradesTableParent;
