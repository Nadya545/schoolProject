import React, { useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import Button from "../../../ui/button/Button";
import CorrectScoreModal from "../../../ui/modal/CorrectScoreModal";
import { Student } from "../../../types/studentType";
import {
  useDeleteScoreMutation,
  useUpdateScoreMutation,
  Score,
} from "../../../store/api/scoresApi";

interface GradeItemProps {
  grade: Score;
  role: "teacher" | "parent" | "student";
  id?: string;
  children: number[] | undefined;
  loadGrades: () => void;
}

const GradeItem: React.FC<GradeItemProps> = ({
  grade,
  role,
  children,
  loadGrades,
}) => {
  const studentCards = useAppSelector((state) => state.students.studentCards);

  // 🎯 Используем RTK Query мутации для удаления и обновления оценок
  const [deleteScore, { isLoading: deleteLoading }] = useDeleteScoreMutation();
  const [updateScoreMutation, { isLoading: updateLoading }] =
    useUpdateScoreMutation();

  // ДОБАВЬТЕ ЭТОТ ВЫВОД ДЛЯ ДИАГНОСТИКИ
  const allStudents = React.useMemo(() => {
    const students = studentCards.flatMap((card) => card.students);
    console.log(
      "🔍 ALL STUDENTS WITH IDs:",
      students.map((s) => ({ id: s.id, type: typeof s.id, name: s.name }))
    );
    return students;
  }, [studentCards]);

  // ИСПРАВЛЕННЫЙ поиск - сравниваем как строки
  const student = React.useMemo(() => {
    return allStudents.find((s) => {
      // Приводим оба ID к строке для надежного сравнения
      const studentIdStr = String(s.id);
      const gradeStudentIdStr = String(grade.studentId);
      console.log(
        "🔍 COMPARING AS STRINGS:",
        studentIdStr,
        "===",
        gradeStudentIdStr
      );
      return studentIdStr === gradeStudentIdStr;
    });
  }, [allStudents, grade.studentId]);

  // ИСПРАВЛЕННЫЙ поиск для родителя
  const currentChild = React.useMemo(() => {
    if (!student || !children) return null;

    // Приводим ID студента к числу и проверяем в массиве children
    const studentIdNum = Number(student.id);
    // Если не получается преобразовать в число, ищем как строку
    if (isNaN(studentIdNum)) {
      return children.includes(Number(student.id)) ? student : null;
    }
    return children.includes(studentIdNum) ? student : null;
  }, [student, children]);

  console.log("🎯 FINAL RESULT - student:", student);
  console.log("🎯 FINAL RESULT - currentChild:", currentChild);

  console.log("🔍 ALL STUDENTS:", allStudents);
  console.log("🔍 SEARCHING FOR STUDENT ID:", grade.studentId);

  // Отладочная информация
  console.log("📊 GradeItem debug:", {
    studentCards,
    student,
    currentChild,
    gradeStudentId: grade.studentId,
    children,
  });

  const renderStudentName = () => {
    if (student) {
      return `${student.name} ${student.surname}`;
    }
    return `Студент ID: ${grade.studentId}`;
  };

  const renderParentStudentName = () => {
    if (currentChild) {
      return `${currentChild.name} ${currentChild.surname}`;
    }
    return `Ребенок ID: ${grade.studentId}`;
  };

  // 🎯 УДАЛЕНИЕ ОЦЕНКИ ЧЕРЕЗ RTK Query
  const deleteScoreHandler = async () => {
    const isConfirmed = window.confirm(
      "Вы уверены, что хотите удалить эту оценку?"
    );
    if (!isConfirmed) return;

    try {
      await deleteScore(grade.id).unwrap();
      console.log("✅ Оценка удалена через RTK Query");
      loadGrades(); // Обновляем список оценок
    } catch (error) {
      console.error("❌ Ошибка удаления оценки:", error);
      alert("Не удалось удалить оценку, попробуйте позже!");
    }
  };

  // 🎯 ОБНОВЛЕНИЕ ОЦЕНКИ ЧЕРЕЗ RTK Query
  const updateScoreHandler = async (updateData: Partial<Score>) => {
    try {
      await updateScoreMutation({
        scoreId: grade.id,
        updatedData: updateData,
      }).unwrap();
      console.log("✅ Оценка обновлена через RTK Query");
      loadGrades(); // Обновляем список оценок
    } catch (error) {
      console.error("❌ Ошибка обновления оценки:", error);
      alert("Не удалось отредактировать оценку, попробуйте позже!");
    }
  };

  return (
    <div className="grade-item">
      {role === "parent" && (
        <div className="gradesForParent">{renderParentStudentName()}</div>
      )}

      {role === "teacher" && (
        <>
          <CorrectScoreModal updateScore={updateScoreHandler} grade={grade} />
          <Button
            size="normal"
            onClick={deleteScoreHandler}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Удаление..." : "Удалить"}
          </Button>
        </>
      )}

      <div className="gradesForEveryone">
        <div>{new Date(grade.date).toLocaleDateString()}</div>
        <div> 👨‍🎓{renderStudentName()}</div>
        <div>📚 {grade.subject}</div>
        <div>⭐ {grade.score}</div>
        <div>📝 {grade.type}</div>
        <div>{grade.comment}</div>
      </div>
    </div>
  );
};

export default GradeItem;
