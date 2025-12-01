import React from "react";
import { Score } from "../../../store/api/scoresApi";
import "./gradesForStudent.scss";
import { User } from "../../../store/api/usersApi";
interface GradeTableStudentProps {
  studentData: User;
  studentGrades: Score[];
}
const GradeTableStudent: React.FC<GradeTableStudentProps> = ({
  studentData,
  studentGrades,
}) => {
  const validGrades = studentGrades
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
  // Инициализируем объект для всех дат
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
    <div className="student-grades-table">
      <div className="student-info">
        <h2>Мои оценки</h2>
        <div className="student-details">
          {studentData.surname} {studentData.name} • {studentData.class}
        </div>
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
                    <td key={`grade-${subject}-${date}`} className="grade-cell">
                      {grade ? (
                        <div className="compact-grade">
                          <span className={`grade-badge grade-${grade.score}`}>
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
  );
};

export default GradeTableStudent;
