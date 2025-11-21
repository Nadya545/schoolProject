import React, { useEffect, useState } from "react";
import { useGetUser } from "../../../hooks/useGetUser";
import { Score, apiForScore } from "../../../services/apiForScore";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";
import GradeItem from "./GradeItem";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { updateStudentCards } from "../../../store/slices/studentsSlice";

const GradesList = () => {
  console.log("🎯 1. GradesList компонент начал рендериться");

  const navigate = useNavigate();
  console.log("🎯 2. useNavigate отработал");

  const dispatch = useAppDispatch();
  const studentCardsRedux = useAppSelector(
    (state) => state.students.studentCards
  );
  console.log("🎯 3. Redux state получен:", studentCardsRedux);

  const [grades, setGrades] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncStudentsFromDatabase = async () => {
    try {
      console.log("🔄 Синхронизация студентов из базы данных...");

      // Получить всех пользователей из базы
      const usersResponse = await fetch("http://localhost:3001/users");
      const allUsers = await usersResponse.json();

      console.log("🔍 ALL USERS FROM DATABASE:", allUsers);

      // Отфильтровать только студентов
      const students = allUsers.filter((user: any) => user.role === "student");
      console.log("👥 FILTERED STUDENTS:", students);

      // Проверим, есть ли студент с ID 13
      const studentWithId13 = students.find(
        (s: any) => s.id == 13 || s.id == "13"
      );
      console.log("🎯 STUDENT WITH ID 13:", studentWithId13);

      // Создать структуру классов для Redux
      const classesMap = new Map();

      students.forEach((student: any) => {
        if (!student.class) return;

        const className = student.class;
        const number = parseInt(className);
        const letter = className.replace(number.toString(), "");

        const key = `${number}-${letter}`;

        if (!classesMap.has(key)) {
          classesMap.set(key, {
            id: Date.now() + Math.random(),
            number,
            letter,
            students: [],
          });
        }

        classesMap.get(key).students.push({
          id: student.id,
          name: student.name || "",
          surname: student.surname || "",
        });
      });

      const studentCards = Array.from(classesMap.values());
      console.log("📚 FINAL STUDENT CARDS FOR REDUX:", studentCards);

      // Обновить Redux
      dispatch(updateStudentCards(studentCards));
    } catch (error) {
      console.error("❌ Ошибка синхронизации студентов:", error);
    }
  };

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

  console.log("🎯 8. State инициализирован");

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);

      let loadedGrades: Score[] = [];

      if (currentUser.role === "student" && currentUser.id) {
        loadedGrades = await apiForScore.getScoreByStudentId(currentUser.id);
      } else if (currentUser.role === "parent" && currentUser.id) {
        loadedGrades = await apiForScore.getScoreByParentId(currentUser.id);
      } else if (currentUser.role === "teacher" && currentUser.id) {
        loadedGrades = await apiForScore.getScoreForTeacherFromRedux(
          currentUser.id,
          studentCardsRedux
        );
      }

      setGrades(loadedGrades);
    } catch (err) {
      setError("Ошибка загрузки оценок, попробуйте позже!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await syncStudentsFromDatabase();
      await loadGrades();
    };
    loadData();
  }, []);

  console.log("🎨 15. Рендерим JSX компонента");

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
          <>
            <Button size="normal" onClick={() => navigate("/create-grade")}>
              Поставить оценку
            </Button>
            <Button size="normal" onClick={syncStudentsFromDatabase}>
              🔄 Обновить студентов
            </Button>
          </>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div>Загрузка оценок...</div>}
      {!error && !loading && (
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
                    loadGrades={loadGrades}
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
