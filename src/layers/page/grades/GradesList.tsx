import React, { useEffect, useState } from "react";
import { useGetUser } from "../../../hooks/useGetUser";
import { Score, api } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";
import GradeItem from "./GradeItem";

const GradesList = () => {
  const navigate = useNavigate();

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

  const loadCrades = async () => {
    try {
      setLoading(true);
      setError(null);
      if (currentUser.role === "student" && currentUser.id) {
        const studentGrades = await api.getScoreByStudentId(currentUser.id);
        setGrades(studentGrades);
      } else if (currentUser.role === "parent" && currentUser.id) {
        const gradesForParent = await api.getScoreByParentId(currentUser.id);
        setGrades(gradesForParent);
      } else if (currentUser.role === "teacher" && currentUser.id) {
        const gradeRorTeacher = await api.getScoreForTeacher(currentUser.id);
        setGrades(gradeRorTeacher);
      }
    } catch (err) {
      setError("Ошибка загрузки оценок, попробуйте позже!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrades();
  }, [currentUser]);

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
