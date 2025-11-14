import React, { useEffect, useState } from "react";
import { useGetUser } from "../../../hooks/useGetUser";
import { Score, api } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";
import GradeItem from "./GradeItem";
import { useAppSelector } from "../../../store/hooks";

const GradesList = () => {
  const navigate = useNavigate();

  const studentCardsRedux = useAppSelector(
    (state) => state.students.studentCards
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const { getCurrentUser } = useGetUser();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return "Пожалуйста войдите в систему!";
  }
  const [grades, setGrades] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Загрузка оценок для пользователя:", currentUser);

      let loadedGrades: Score[] = [];

      if (currentUser.role === "student" && currentUser.id) {
        loadedGrades = await api.getScoreByStudentId(currentUser.id);
      } else if (currentUser.role === "parent" && currentUser.id) {
        loadedGrades = await api.getScoreByParentId(currentUser.id);
      } else if (currentUser.role === "teacher" && currentUser.id) {
        loadedGrades = await api.getScoreForTeacherFromRedux(
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
    loadGrades();
  }, []);

  return (
    <div className="gradeList">
      <div>
        {" "}
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

      {error && <div className="error">{error}</div>}
      {loading && <div>Загрузка оценок...</div>}
      {!error && !loading && (
        <div>
          {grades.length === 0 ? (
            <div>Оценок пока нет...</div>
          ) : (
            grades.map((grade) => (
              <div key={grade.id}>
                <GradeItem
                  grade={grade}
                  role={currentUser.role}
                  id={currentUser.id}
                  children={currentUser.children}
                  loadGrades={loadGrades}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GradesList;
