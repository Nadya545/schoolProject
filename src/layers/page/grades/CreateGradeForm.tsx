import React, { useEffect, useState } from "react";
import { Student } from "../../../types/studentType";
import { useGetUser } from "../../../hooks/useGetUser";
import { useAppSelector } from "../../../store/hooks";
import Button from "../../../ui/button/Button";
import Input from "../../../ui/input/Input";
import { useNavigate } from "react-router-dom";
import { useCreateScoreMutation } from "../../../store/api/scoresApi";

const CreateGradeForm = () => {
  const { getCurrentUser } = useGetUser();
  const teacher = getCurrentUser();
  const studentCards = useAppSelector((state) => state.students.studentCards);
  const navigate = useNavigate();

  // 🎯 Используем RTK Query мутацию для создания оценки
  const [createScore, { isLoading: createLoading, error: createError }] =
    useCreateScoreMutation();

  interface NewGrade {
    class: string;
    studentId: string;
    teacherId?: string;
    subject?: string;
    score: number;
    type: string;
    comment: string;
    date: string;
  }

  const [formData, setFormData] = useState<NewGrade>({
    class: "",
    studentId: "",
    teacherId: "",
    score: 0,
    type: "",
    comment: "",
    date: "",
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState({
    class: "",
    studentId: "",
    teacherId: "",
    score: "",
    type: "",
    comment: "",
    date: "",
  });

  const handleClass = (classItem: string) => {
    setFormData((prev) => {
      if (prev.class === classItem) {
        setStudents([]);
        setError((prev) => ({ ...prev, class: "" }));
        return {
          ...prev,
          class: "",
          studentId: "",
        };
      } else {
        try {
          const selectedClassCard = studentCards.find((card) => {
            return `${card.number}${card.letter}` === classItem;
          });

          if (selectedClassCard) {
            setStudents(selectedClassCard.students);
            setError((prev) => ({ ...prev, class: "" }));
          } else {
            setStudents([]);
            setError((prev) => ({
              ...prev,
              class: `Класс "${classItem}" не найден в базе данных`,
            }));
          }
        } catch (error) {
          console.error("Ошибка загрузки учеников:", error);
          setError((prev) => ({ ...prev, class: "Ошибка загрузки данных" }));
        }
        return {
          ...prev,
          class: classItem,
        };
      }
    });
  };

  const handleStudent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      studentId: studentId,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error[name as keyof typeof error]) {
      setError((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newError = {
      class: "",
      studentId: "",
      teacherId: "",
      score: "",
      type: "",
      comment: "",
      date: "",
    };

    let isValid = true;

    if (!formData.class) {
      newError.class = "Выберете один класс!";
      isValid = false;
    }
    if (!formData.studentId) {
      newError.studentId = "Выберете ученика!";
      isValid = false;
    }

    if (!formData.score) {
      newError.score = "Выберете оценку!";
      isValid = false;
    }
    if (!formData.type.trim()) {
      newError.type = "Введите тип работы!";
      isValid = false;
    }

    setError(newError);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("👨‍🏫 Teacher перед созданием:", teacher);
    console.log("Teacher ID:", teacher?.id);
    console.log("Teacher subject:", teacher?.subject);

    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (createLoading) {
      alert("Подождите, создается оценка...");
      return;
    }

    try {
      const newGrade = {
        class: formData.class,
        studentId: formData.studentId,
        teacherId: teacher?.id,
        subject: teacher?.subject,
        score: formData.score,
        type: formData.type,
        comment: formData.comment,
        date: new Date().toISOString().split("T")[0],
      };

      console.log("📝 Создаем оценку:", newGrade);

      // 🎯 СОЗДАЕМ ОЦЕНКУ ЧЕРЕЗ RTK Query
      const result = await createScore(newGrade).unwrap();
      console.log("✅ Оценка создана:", result);

      navigate("/grades-list");
    } catch (error) {
      console.error("❌ Ошибка создания оценки:", error);
      setError((prev) => ({
        ...prev,
        score: "Ошибка сервера, попробуйте позже.",
      }));
    }
  };

  return (
    <form className="createForm" onSubmit={handleSubmit}>
      {/* Показываем ошибки RTK Query */}
      {createError && (
        <div className="error-message global-error">
          ❌ Ошибка при создании оценки
        </div>
      )}

      <p>Выберете класc:</p>
      <div className="class">
        {teacher?.classes?.map((classItem) => {
          return (
            <Button
              size="normal"
              type="button"
              key={classItem}
              active={formData.class === classItem}
              onClick={() => handleClass(classItem)}
              disabled={createLoading}
            >
              {classItem}
            </Button>
          );
        })}
      </div>
      {error.class && (
        <div
          className="error-message"
          style={{ color: "red", margin: "10px 0" }}
        >
          ⚠️ {error.class}
        </div>
      )}

      <div>
        <p>Выберете ученика:</p>
        <select
          value={formData.studentId}
          onChange={handleStudent}
          disabled={createLoading}
        >
          <option value={0}>Выберете ученика</option>
          {students.map((student) => (
            <option value={student.id} key={student.id}>
              {student.name} {student.surname}
            </option>
          ))}
        </select>
      </div>

      <select
        value={formData.score}
        name="score"
        onChange={handleInputChange}
        disabled={createLoading}
      >
        <option value={0}>Выберите оценку</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
      </select>

      <div className="type">
        <Input
          type="text"
          name="type"
          value={formData.type}
          placeholder="Введите тип оцениваемой работы..."
          onChange={handleInputChange}
          error={!!error.type}
          required
          disabled={createLoading}
        />
      </div>

      <div className="comment">
        <Input
          type="text"
          name="comment"
          value={formData.comment}
          placeholder="Оставьте комментарий..."
          onChange={handleInputChange}
          error={!!error.comment}
          required
          disabled={createLoading}
        />
      </div>

      <Button type="submit" size="normal" disabled={createLoading}>
        {createLoading ? "Создание оценки..." : "Поставить оценку"}
      </Button>
    </form>
  );
};

export default CreateGradeForm;
