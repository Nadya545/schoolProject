import React, { useEffect, useState } from "react";
import { useGetUser } from "../../../hooks/useGetUser";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";
import { useAppSelector } from "../../../store/hooks";
import { useStudentsSync } from "../../page/student-list/useStudentsSync";
import { useGetScoresQuery } from "../../../store/api/scoresApi";
import { Score } from "../../../store/api/scoresApi";
import GradesTable from "./GradesTable";
import "./grades.scss";
import { Student } from "../../../types/studentType";
import GradeTableStudent from "./GradeTableStudent";
import { getFilteredGrades } from "./getFilteredGrades";
import { getStudentsOfSelectedClass } from "./getStudentsOfSelectedClass";

const GradesList = () => {
  // 🔥 ХУКИ (порядок стабильный)
  const navigate = useNavigate();
  const { getCurrentUser } = useGetUser();
  const currentUser = getCurrentUser();

  const { isLoading: studentsLoading, error: studentsError } =
    useStudentsSync();
  const studentCardsRedux = useAppSelector(
    (state) => state.students.studentCards
  );

  // 🔥 СОХРАНЯЕМ ВЫБРАННЫЙ КЛАСС В localStorage
  const [selectedClass, setSelectedClass] = useState(() => {
    return localStorage.getItem("selectedClass") || "";
  });

  // 🔥 СОХРАНЯЕМ КЛАСС ПРИ ИЗМЕНЕНИИ
  useEffect(() => {
    if (selectedClass) {
      localStorage.setItem("selectedClass", selectedClass);
    }
  }, [selectedClass]);

  const {
    data: allScores = [],
    isLoading: scoresLoading,
    error: scoresError,
    refetch: refetchScores,
  } = useGetScoresQuery();

  // 🔥 ОБНОВЛЯЕМ ДАННЫЕ БЕЗ СБРОСА СОСТОЯНИЯ
  const handleReloadGrades = () => {
    refetchScores();
    // selectedClass НЕ СБРАСЫВАЕТСЯ!
  };

  // 🔥 УСЛОВНЫЕ ВОЗВРАТЫ
  if (!currentUser) {
    return <div className="gradeList">Пожалуйста войдите в систему!</div>;
  }

  if (studentsLoading) {
    return (
      <div className="gradeList">
        <div className="loading">🔄 Загрузка данных студентов...</div>
      </div>
    );
  }

  if (studentsError || !studentCardsRedux || studentCardsRedux.length === 0) {
    return (
      <div className="gradeList">
        <div className="error">❌ Ошибка загрузки студентов</div>
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  const studentsOfSelectedClass = getStudentsOfSelectedClass(
    selectedClass,
    studentCardsRedux
  );

  // Какие оценки показывать
  const filteredGrades = getFilteredGrades(
    currentUser,
    allScores,
    studentsOfSelectedClass
  );

  const handleLogout = () => {
    navigate("/");
  };
  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    if (newClass === "") {
      localStorage.removeItem("selectedClass"); // 🔥 ОЧИЩАЕМ ЕСЛИ ВЫБРАЛИ "Все классы"
    }
  };
  const isLoading = studentsLoading || scoresLoading;
  const hasError = studentsError || scoresError;

  // 🔥 ДОБАВЛЯЕМ КНОПКУ ДЛЯ УЧИТЕЛЯ
  const showCreateGradeButton = currentUser.role === "teacher" && selectedClass;

  return (
    <div className="gradeList">
      <div className="gradeList-header">
        <Button
          size="addAndOut"
          className="btn-class-list"
          onClick={handleLogout}
        >
          На главную
        </Button>

        <h1 className="gradeList-title">Журнал оценок</h1>

        {currentUser.role === "teacher" && (
          <div className="class-selector">
            <label>Выберите класс: </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
            >
              <option value="">Все классы</option>
              {currentUser.classes?.map((classItem) => (
                <option key={classItem} value={classItem}>
                  {classItem}
                </option>
              ))}
            </select>
            {currentUser.subject && (
              <span className="teacher-subject">
                Предмет: {currentUser.subject}
              </span>
            )}
            {showCreateGradeButton && (
              <Button
                size="addAndOut"
                onClick={() => navigate("/create-grade")}
                className="create-grade-btn"
              >
                Поставить оценку
              </Button>
            )}
          </div>
        )}
      </div>

      {hasError && <div className="error">❌ Ошибка загрузки данных</div>}

      {isLoading && <div>🔄 Загрузка...</div>}

      {!hasError && !isLoading && (
        <div className="grades-content">
          {filteredGrades.length === 0 ||
          studentsOfSelectedClass.length === 0 ? (
            <div className="no-grades">
              {studentsOfSelectedClass.length === 0
                ? `📝 Нет студентов в классе ${selectedClass || ""}`
                : "📝 Оценок пока нет..."}
            </div>
          ) : (
            <>
              {currentUser.role === "teacher" && (
                <GradesTable
                  loadGrades={handleReloadGrades}
                  grades={filteredGrades}
                  role={currentUser.role}
                  children={currentUser.children}
                  reLoadGrades={handleReloadGrades}
                  subject={currentUser.subject || ""}
                  students={studentsOfSelectedClass}
                  selectedClass={selectedClass}
                />
              )}
              {currentUser.role === "student" && (
                <GradeTableStudent
                  studentData={currentUser}
                  studentGrades={filteredGrades}
                />
              )}
              {currentUser.role === "parent" && (
                <GradesTable
                  loadGrades={handleReloadGrades}
                  grades={filteredGrades}
                  role={currentUser.role}
                  children={currentUser.children}
                  reLoadGrades={handleReloadGrades}
                  subject={currentUser.subject || ""}
                  students={studentsOfSelectedClass}
                  selectedClass={selectedClass}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GradesList;
