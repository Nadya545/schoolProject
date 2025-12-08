import React, { useEffect, useState, useMemo } from "react";
import { useGetUser } from "../../../hooks/useGetUser";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";
import { useAppSelector } from "../../../store/hooks";
import { useStudentsSync } from "../../page/student-list/useStudentsSync";
import { useGetScoresQuery } from "../../../store/api/scoresApi";
import GradesTable from "./GradesTableTeacher";
import "./grades.scss";
import GradeTableStudent from "./GradesTableStudent";
import { getFilteredGrades } from "./getFilteredGrades";
import { getStudentsOfSelectedClass } from "./getStudentsOfSelectedClass";
import GradesTableParent from "./GradesTableParent";
import { Student } from "../../../types/studentType";

const GradesList = () => {
  // 🔥 ХУКИ (порядок стабильный) - ВСЕ ХУКИ В НАЧАЛЕ!
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
  const [selectedChild, setSelectedChild] = useState(() => {
    return localStorage.getItem("selectedChild") || "";
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

  // 🔧 Функция нормализации ID - всегда к строке
  const normalizeId = (id: any): string => {
    if (id === null || id === undefined) return "";
    return String(id).trim();
  };

  // 🔥 ВЫЧИСЛЕНИЯ ДО УСЛОВНЫХ RETURN - useMemo тоже хук!
  const allStudents = useMemo(() => {
    if (!studentCardsRedux || studentCardsRedux.length === 0) return [];
    return studentCardsRedux.flatMap((card) =>
      card.students.map((student) => ({
        ...student,
        class: `${card.number}${card.letter}`,
      }))
    );
  }, [studentCardsRedux]);

  // Находим детей по ID с нормализацией
  const childrenObjects = useMemo(() => {
    if (!currentUser?.children || !allStudents.length) return [];
    return currentUser.children
      .map((childId: any) => {
        const normalizedChildId = normalizeId(childId);
        const child = allStudents.find(
          (student) => normalizeId(student.id) === normalizedChildId
        );
        return child || null;
      })
      .filter(Boolean);
  }, [currentUser?.children, allStudents]);

  // Вычисления для студентов выбранного класса
  const studentsOfSelectedClass = useMemo(() => {
    if (!selectedClass || !studentCardsRedux) return [];
    return getStudentsOfSelectedClass(selectedClass, studentCardsRedux);
  }, [selectedClass, studentCardsRedux]);

  // Какие оценки показывать (основной фильтр)
  const filteredGrades = useMemo(() => {
    if (!currentUser || !allScores || allScores.length === 0) return [];
    return getFilteredGrades(currentUser, allScores, studentsOfSelectedClass);
  }, [currentUser, allScores, studentsOfSelectedClass]);

  // Фильтруем оценки в зависимости от выбранного ребенка
  const gradesToDisplay = useMemo(() => {
    if (!currentUser || currentUser.role !== "parent") return filteredGrades;

    if (selectedChild) {
      // Фильтруем только оценки выбранного ребенка
      const childGrades = filteredGrades.filter(
        (score) => normalizeId(score.studentId) === normalizeId(selectedChild)
      );
      console.log(
        `📊 Оценки для ребенка ${selectedChild}:`,
        childGrades.length
      );
      return childGrades;
    }

    console.log("📊 Показываем оценки всех детей:", filteredGrades.length);
    return filteredGrades;
  }, [filteredGrades, selectedChild, currentUser]);

  // 🔥 ТЕПЕРЬ УСЛОВНЫЕ ВОЗВРАТЫ
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

  // 🔥 ОБРАБОТЧИКИ СОБЫТИЙ
  const handleLogout = () => {
    navigate("/");
  };

  const handleReloadGrades = () => {
    refetchScores();
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    if (newClass === "") {
      localStorage.removeItem("selectedClass");
    }
  };

  const handleChildChange = (child: string) => {
    console.log("🎯 handleChildChange вызван с:", child);
    setSelectedChild(child);
    if (child) {
      localStorage.setItem("selectedChild", child);
    } else {
      localStorage.removeItem("selectedChild");
    }
  };

  // 🔥 ВЫЧИСЛЕНИЯ ДЛЯ РЕНДЕРА
  const isLoading = studentsLoading || scoresLoading;
  const hasError = studentsError || scoresError;
  const showCreateGradeButton = currentUser.role === "teacher" && selectedClass;

  // 🔥 ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
  console.log("=== DEBUG РОДИТЕЛЬ ===");
  console.log("Родитель ID:", currentUser.id);
  console.log("Дети (ID):", currentUser.children);
  console.log("Все студенты:", allStudents.length);
  console.log("Найденные дети:", childrenObjects);
  console.log("🎯 Оценок для отображения:", gradesToDisplay.length);
  console.log("👶 Выбранный ребенок:", selectedChild);

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
        {currentUser.role === "parent" && (
          <div className="class-selector">
            <label>Выберите своего ребенка: </label>

            <select
              value={selectedChild}
              onChange={(e) => handleChildChange(e.target.value)}
            >
              <option value="">Все дети</option>
              {childrenObjects?.map((child: Student) => (
                <option key={child.id} value={child.id.toString()}>
                  {child.name} {child.surname}
                </option>
              ))}
            </select>
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
                <GradesTableParent
                  parentData={currentUser}
                  childGrades={gradesToDisplay}
                  selectedChild={selectedChild}
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
