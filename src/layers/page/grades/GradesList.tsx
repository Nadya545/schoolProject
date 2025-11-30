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

  //Кого показывать, каких именно студентов?
  let studentsOfSelectedClass: Student[] = [];
  if (!selectedClass) {
    // Все студенты всех классов
    studentsOfSelectedClass = studentCardsRedux.flatMap(
      (card) => card.students || []
    );
  } else {
    // Студенты выбранного класса
    const card = studentCardsRedux.find(
      (card) => `${card.number}${card.letter}` === selectedClass
    );
    studentsOfSelectedClass = card?.students || [];
  }

  // Какие оценки показывать
  let filteredGrades: Score[] = [];

  if (currentUser.role === "student") {
    // Оценки текущего студента
    filteredGrades = allScores.filter(
      (score) => score.studentId?.toString() === currentUser.id?.toString()
    );
  } else if (currentUser.role === "parent") {
    // Оценки детей родителя
    const childrenIds = (currentUser.children || []).map(String);
    filteredGrades = allScores.filter((score) =>
      childrenIds.includes(score.studentId?.toString() || "")
    );
  } else if (currentUser.role === "teacher") {
    // Оценки по предмету учителя для выбранных студентов
    const studentIds = studentsOfSelectedClass.map((student) =>
      student.id.toString()
    );
    filteredGrades = allScores.filter(
      (score) =>
        score.subject === currentUser.subject &&
        studentIds.includes(score.studentId?.toString() || "")
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedClass"); // 🔥 ОЧИЩАЕМ ПРИ ВЫХОДЕ
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
          Выход
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
        </div>
      )}
    </div>
  );
};

export default GradesList;

/*import React, { useEffect, useState } from "react";
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

const GradesList = () => {
  // 🔥 ПРОСТЫЕ ХУКИ
  const navigate = useNavigate();
  const { getCurrentUser } = useGetUser();
  const currentUser = getCurrentUser();

  const { isLoading: studentsLoading, error: studentsError } =
    useStudentsSync();
  const studentCardsRedux = useAppSelector(
    (state) => state.students.studentCards
  );

  const [selectedClass, setSelectedClass] = useState("");
  const [grades, setGrades] = useState<Score[]>([]);

  // 🔥 ОДИН ПРОСТОЙ ЗАПРОС
  const {
    data: allScores = [],
    isLoading: scoresLoading,
    error: scoresError,
    refetch: refetchScores,
  } = useGetScoresQuery();

  // 🔥 УСЛОВНЫЕ ВОЗВРАТЫ СРАЗУ ПОСЛЕ ХУКОВ
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

  // 🔥 ПРОСТАЯ ФИЛЬТРАЦИЯ СТУДЕНТОВ (без useMemo)
  let studentsOfSelectedClass: Student[] = [];
  if (!selectedClass) {
    studentsOfSelectedClass = studentCardsRedux.flatMap(
      (card) => card.students || []
    );
  } else {
    const card = studentCardsRedux.find(
      (card) => `${card.number}${card.letter}` === selectedClass
    );
    studentsOfSelectedClass = card?.students || [];
  }

  // 🔥 ПРОСТАЯ ФИЛЬТРАЦИЯ ОЦЕНОК (без useMemo)
  let filteredGrades: Score[] = [];
  if (currentUser.role === "student") {
    filteredGrades = allScores.filter(
      (score) => score.studentId?.toString() === currentUser.id.toString()
    );
  } else if (currentUser.role === "parent") {
    const childrenIds = (currentUser.children || []).map(String);
    filteredGrades = allScores.filter((score) =>
      childrenIds.includes(score.studentId?.toString() || "")
    );
  } else if (currentUser.role === "teacher") {
    const studentIds = studentsOfSelectedClass.map((student) =>
      student.id.toString()
    );
    filteredGrades = allScores.filter(
      (score) =>
        score.subject === currentUser.subject &&
        studentIds.includes(score.studentId?.toString() || "")
    );
  }

  // 🔥 ОБНОВЛЕНИЕ ОЦЕНОК ПРИ ИЗМЕНЕНИИ ДАННЫХ
  useEffect(() => {
    setGrades(filteredGrades);
  }, [filteredGrades]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isLoading = studentsLoading || scoresLoading;
  const hasError = studentsError || scoresError;

  return (
    <div className="gradeList">
      <div className="gradeList-header">
        <Button
          size="addAndOut"
          className="btn-class-list"
          onClick={handleLogout}
        >
          Выход
        </Button>

        <h1 className="gradeList-title">Журнал оценок</h1>

        {currentUser.role === "teacher" && (
          <>
            <div className="class-selector">
              <label>Выберите класс: </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
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
            </div>
            <Button
              size="addAndOut"
              onClick={() => navigate("/create-grade")}
              className="create-grade-btn"
            >
              Поставить оценку
            </Button>
          </>
        )}
      </div>

      {hasError && <div className="error">❌ Ошибка загрузки данных</div>}

      {isLoading && <div>🔄 Загрузка...</div>}

      {!hasError && !isLoading && (
        <div className="grades-content">
          {grades.length === 0 ? (
            <div className="no-grades">📝 Оценок пока нет...</div>
          ) : (
            <GradesTable
              loadGrades={refetchScores}
              grades={grades}
              role={currentUser.role}
              children={currentUser.children}
              reLoadGrades={refetchScores}
              subject={currentUser.subject}
              students={studentsOfSelectedClass}
              selectedClass={selectedClass}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GradesList;*/
/*import React, { useEffect, useMemo, useState } from "react";
import { useGetUser } from "../../../hooks/useGetUser";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";
import { useAppSelector } from "../../../store/hooks";
import { useStudentsSync } from "../../page/student-list/useStudentsSync";
import {
  useGetScoresQuery,
  useGetScoreByStudentIdQuery,
} from "../../../store/api/scoresApi";
import { Score } from "../../../store/api/scoresApi";
import GradesTable from "./GradesTable";
import "./grades.scss";

const GradesList = () => {
  console.log("🎯 1. GradesList компонент начал рендериться");

  // 🔥 ПРОСТЫЕ ХУКИ В НАЧАЛЕ
  const navigate = useNavigate();
  const { getCurrentUser } = useGetUser();
  const currentUser = getCurrentUser();

  // Синхронизация студентов
  const { isLoading: studentsLoading, error: studentsError } =
    useStudentsSync();
  const studentCardsRedux = useAppSelector(
    (state) => state.students.studentCards
  );

  // Состояния
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [grades, setGrades] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 ПРОСТОЙ ЗАПРОС ВСЕХ ОЦЕНОК (всегда вызывается)
  const {
    data: allScores = [],
    isLoading: scoresLoading,
    error: scoresError,
    refetch: refetchScores,
  } = useGetScoresQuery();

  // 🔥 ПРОСТОЙ ЗАПРОС ДЛЯ СТУДЕНТА (всегда вызывается)
  const studentScoresQuery = useGetScoreByStudentIdQuery(
    currentUser?.id || "0",
    {
      skip: !currentUser || currentUser.role !== "student",
    }
  );

  // 🔥 ФИЛЬТРАЦИЯ ОЦЕНОК В useMemo
  const filteredGrades = useMemo(() => {
    if (!currentUser) return [];

    console.log(
      "🔍 Фильтруем оценки для пользователя:",
      currentUser.role,
      currentUser.id
    );

    switch (currentUser.role) {
      case "student":
        return studentScoresQuery.data || [];

      case "parent": {
        if (!currentUser.children || currentUser.children.length === 0)
          return [];
        const childrenIds = currentUser.children.map(String);
        return allScores.filter((score) =>
          childrenIds.includes(score.studentId?.toString() || "")
        );
      }

      case "teacher": {
        if (!currentUser.subject || !currentUser.classes) return [];

        // Получаем студентов учителя из Redux
        const teacherStudents = studentCardsRedux.flatMap((card) =>
          card.students.filter((student) =>
            currentUser.classes?.includes(`${card.number}${card.letter}`)
          )
        );

        const studentIds = teacherStudents.map((student) =>
          student.id.toString()
        );

        return allScores.filter(
          (score) =>
            score.subject === currentUser.subject &&
            studentIds.includes(score.studentId?.toString() || "")
        );
      }

      default:
        return [];
    }
  }, [currentUser, allScores, studentScoresQuery.data, studentCardsRedux]);

  // 🔥 УСЛОВНЫЕ ВОЗВРАТЫ ПОСЛЕ ВСЕХ ХУКОВ
  if (!currentUser) {
    return "Пожалуйста войдите в систему!";
  }

  if (studentsLoading || !studentCardsRedux || studentCardsRedux.length === 0) {
    return (
      <div className="gradeList">
        <div className="loading">🔄 Загрузка данных студентов...</div>
      </div>
    );
  }

  if (studentsError) {
    return (
      <div className="gradeList">
        <div className="error">
          ❌ Ошибка загрузки студентов: {String(studentsError)}
        </div>
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  // 🔥 ЛОГИКА КОМПОНЕНТА
  const allStudents = useMemo(() => {
    return studentCardsRedux.flatMap((card) => card.students || []);
  }, [studentCardsRedux]);

  const studentsOfSelectedClass = useMemo(() => {
    console.log("🔍 Фильтрация студентов - selectedClass:", selectedClass);

    if (!selectedClass) {
      return allStudents;
    }

    const card = studentCardsRedux.find(
      (card) => `${card.number}${card.letter}` === selectedClass
    );

    if (!card) {
      console.warn("❌ Класс не найден:", selectedClass);
      return [];
    }

    return card.students || [];
  }, [selectedClass, studentCardsRedux, allStudents]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const reLoadGrades = () => {
    refetchScores();
    if (currentUser.role === "student") {
      studentScoresQuery.refetch();
    }
  };

  const loadGrades = () => {
    setGrades(filteredGrades);
  };

  useEffect(() => {
    loadGrades();
  }, [filteredGrades]);

  // Состояния загрузки и ошибок
  const isLoading =
    studentsLoading || scoresLoading || studentScoresQuery.isLoading;
  const hasError = studentsError || scoresError || studentScoresQuery.error;

  console.log("🎨 Рендерим JSX компонента");

  return (
    <div className="gradeList">
      <div className="gradeList-header">
        <Button
          size="addAndOut"
          className="btn-class-list"
          onClick={handleLogout}
        >
          Выход
        </Button>

        <h1 className="gradeList-title">Журнал оценок</h1>

        {currentUser.role === "teacher" && (
          <>
            <div className="class-selector">
              <label>Выберите класс: </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
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
            </div>
            <Button
              size="addAndOut"
              onClick={() => navigate("/create-grade")}
              className="create-grade-btn"
            >
              Поставить оценку
            </Button>
          </>
        )}
      </div>

      {hasError && <div className="error">❌ Ошибка: {String(hasError)}</div>}

      {isLoading && <div>🔄 Загрузка данных...</div>}

      {!hasError && !isLoading && (
        <div className="grades-content">
          {filteredGrades.length === 0 ? (
            <div className="no-grades">📝 Оценок пока нет...</div>
          ) : (
            <GradesTable
              loadGrades={loadGrades}
              grades={filteredGrades}
              role={currentUser.role}
              children={currentUser.children}
              reLoadGrades={reLoadGrades}
              subject={currentUser?.subject}
              students={studentsOfSelectedClass}
              selectedClass={selectedClass}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GradesList;*/
