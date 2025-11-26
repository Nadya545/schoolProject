import React, { useEffect, useState } from "react";
import { useGetUser } from "../../../hooks/useGetUser";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";
import GradeItem from "./GradeItem";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { updateStudentCards } from "../../../store/slices/studentsSlice";
import { useStudentsSync } from "../../page/student-list/useStudentsSync";
import {
  useGetScoreByStudentIdQuery,
  useGetScoreByParentIdQuery,
  useGetScoreForTeacherQuery,
} from "../../../store/api/scoresApi";
import { Score } from "../../../store/api/scoresApi";

const GradesList = () => {
  console.log("🎯 1. GradesList компонент начал рендериться");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // 🔄 Используем хук синхронизации студентов
  const { isLoading: studentsLoading, error: studentsError } =
    useStudentsSync();

  const studentCardsRedux = useAppSelector(
    (state) => state.students.studentCards
  );
  console.log("🎯 3. Redux state получен:", studentCardsRedux);

  const [grades, setGrades] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const { getCurrentUser } = useGetUser();
  console.log("🎯 4. useGetUser вызван");

  const currentUser = getCurrentUser();
  console.log("🎯 5. Текущий пользователь:", currentUser);

  if (!currentUser) {
    console.log("🎯 6. Пользователь не найден, показываем сообщение");
    return "Пожалуйста войдите в систему!";
  }

  console.log("🎯 7. Пользователь найден, инициализируем state");

  // 🎯 Используем RTK Query хуки для загрузки оценок
  const {
    data: studentGrades,
    isLoading: studentGradesLoading,
    error: studentGradesError,
  } = useGetScoreByStudentIdQuery(currentUser.id!, {
    skip: currentUser.role !== "student" || !currentUser.id,
  });

  const {
    data: parentGrades,
    isLoading: parentGradesLoading,
    error: parentGradesError,
  } = useGetScoreByParentIdQuery(currentUser.id!, {
    skip: currentUser.role !== "parent" || !currentUser.id,
  });

  const {
    data: teacherGrades,
    isLoading: teacherGradesLoading,
    error: teacherGradesError,
  } = useGetScoreForTeacherQuery(currentUser.id!, {
    skip: currentUser.role !== "teacher" || !currentUser.id,
  });

  // 🔄 Объединяем загрузку оценок
  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true);
        setError(null);

        let loadedGrades: Score[] = [];

        if (currentUser.role === "student" && studentGrades) {
          loadedGrades = studentGrades;
        } else if (currentUser.role === "parent" && parentGrades) {
          loadedGrades = parentGrades;
        } else if (currentUser.role === "teacher" && teacherGrades) {
          loadedGrades = teacherGrades;
        }

        setGrades(loadedGrades);
      } catch (err) {
        setError("Ошибка загрузки оценок, попробуйте позже!");
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, [currentUser.role, studentGrades, parentGrades, teacherGrades]);

  // Определяем общее состояние загрузки
  const isLoading =
    studentsLoading ||
    studentGradesLoading ||
    parentGradesLoading ||
    teacherGradesLoading;

  // Определяем общую ошибку
  const hasError =
    studentsError ||
    studentGradesError ||
    parentGradesError ||
    teacherGradesError;

  console.log("🎨 15. Рендерим JSX компонента");

  // Показываем состояние загрузки студентов
  if (studentsLoading) {
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

  return (
    <div className="gradeList">
      <div>
        <Button
          size="addAndOut"
          className="btn-class-list"
          onClick={handleLogout}
        >
          Выход
        </Button>
      </div>

      <h1 className="gradeList-title">Журнал оценок</h1>

      <div className="crateGrade">
        {currentUser.role === "teacher" && (
          <Button size="normal" onClick={() => navigate("/create-grade")}>
            Поставить оценку
          </Button>
        )}
      </div>

      {hasError && <div className="error">❌ Ошибка: {String(hasError)}</div>}

      {isLoading && <div>🔄 Загрузка оценок...</div>}

      {!hasError && !isLoading && (
        <div>
          {grades.length === 0 ? (
            <div>Оценок пока нет...</div>
          ) : (
            <div>
              <h3>Найдено {grades.length} оценок:</h3>
              {grades.map((grade) => (
                <div key={grade.id}>
                  <GradeItem
                    grade={grade}
                    role={currentUser.role}
                    id={currentUser.id}
                    children={currentUser.children}
                    loadGrades={() => {
                      // Принудительное обновление через перезагрузку компонента
                      setLoading(true);
                      setTimeout(() => setLoading(false), 100);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GradesList;
