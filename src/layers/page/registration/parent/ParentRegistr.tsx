import { useState } from "react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../../../ui/input/Input";
import Button from "../../../../ui/button/Button";
import { useAppSelector } from "../../../../store/hooks";
import {
  useCreateUserMutation,
  useGetUserByLoginQuery,
} from "../../../../store/api/usersApi";
import "./parent-reg.scss";

const ParentRegistr = () => {
  const navigate = useNavigate();

  // 🎯 Используем RTK Query мутации и запросы
  const [createUser, { isLoading: createLoading, error: createError }] =
    useCreateUserMutation();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    children: [] as string[], // 👈 Изменяем на string[]
  });

  const [error, setError] = useState({
    login: "",
    password: "",
    children: "",
  });

  const studentCards = useAppSelector((state) => state.students.studentCards);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]); // 👈 Изменяем на string[]
  const [searchQuery, setSearchQuery] = useState("");

  // 🔍 Проверяем уникальность логина при изменении
  const { data: existingUser, refetch: checkLogin } = useGetUserByLoginQuery(
    formData.login,
    {
      skip: !formData.login.trim(),
    }
  );

  // Получаем всех студентов из Redux
  let allStudents = studentCards.flatMap((card) => {
    return card.students.map((student) => ({
      ...student,
      class: `${card.number}${card.letter}`,
    }));
  });

  // Фильтруем студентов по поисковому запросу
  const searchStudent = allStudents.filter((student) => {
    return `${student.name} ${student.surname}`
      .toLocaleLowerCase()
      .includes(searchQuery.toLocaleLowerCase());
  });

  // 👇 Исправляем тип параметра на string
  const handleStudentCheckBox = (studentId: string) => {
    const isSelected = selectedStudentIds.includes(studentId);
    if (isSelected) {
      const newSelectedStudentIds = selectedStudentIds.filter((id) => {
        return id !== studentId;
      });
      setSelectedStudentIds(newSelectedStudentIds);
    } else {
      const newSelectedIds = [...selectedStudentIds, studentId];
      setSelectedStudentIds(newSelectedIds);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      login: "",
      password: "",
      children: "",
    };

    let isValid = true;

    if (!formData.login.trim()) {
      newError.login = "Введите логин!";
      isValid = false;
    }
    if (!formData.password) {
      newError.password = "Введите пароль!";
      isValid = false;
    }

    if (selectedStudentIds.length === 0) {
      newError.children = "Выберете ученика!";
      isValid = false;
    }

    // Проверяем уникальность логина
    if (formData.login.trim() && existingUser) {
      newError.login = "Данный логин уже занят!";
      isValid = false;
    }

    setError(newError);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const newParent = {
        login: formData.login,
        password: formData.password,
        role: "parent" as const,
        children: selectedStudentIds.map((id) => parseInt(id)), // 👈 Конвертируем string[] в number[]
      };

      console.log("📝 Создаем родителя:", newParent);

      // 🎯 СОЗДАЕМ РОДИТЕЛЯ В БАЗЕ ДАННЫХ через RTK Query
      await createUser(newParent).unwrap();
      console.log("✅ Родитель создан в базе");

      navigate("/authorisation");
    } catch (error) {
      console.error("❌ Ошибка регистрации:", error);
      setError((prev) => ({
        ...prev,
        login: "Ошибка сервера, попробуйте позже.",
      }));
    }
  };

  return (
    <div className="parent-reg-container">
      <h1 className="parent-reg-title">Регистрация родителя</h1>

      {/* Показываем ошибки RTK Query */}
      {createError && (
        <div className="error-message global-error">
          ❌ Ошибка при создании пользователя
        </div>
      )}

      <form className="parent-reg-form" onSubmit={handleSubmit}>
        <Input
          type="text"
          name="login"
          value={formData.login}
          placeholder="Придумайте логин..."
          onChange={handleInputChange}
          error={!!error.login}
          required
          disabled={createLoading}
        />
        {error.login && <span className="error-message">{error.login}</span>}

        <Input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Придумайте пароль..."
          onChange={handleInputChange}
          error={!!error.password}
          required
          disabled={createLoading}
        />
        {error.password && (
          <span className="error-message">{error.password}</span>
        )}

        <h3 className="choise-student">Выберете ученика</h3>
        <div className="student-list-reg">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск ученика по имени или фамилии..."
            disabled={createLoading}
          />
          {(searchQuery ? searchStudent : allStudents).map((student) => (
            <div className="student-item" key={student.id}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={() => handleStudentCheckBox(student.id)} // 👈 student.id уже string
                  disabled={createLoading}
                />
                <span className="check-children">
                  {student.name} {student.surname} {student.class} класс
                </span>
              </label>
            </div>
          ))}
          {error.children && (
            <span className="error-message">{error.children}</span>
          )}
        </div>

        <Button size="normal" type="submit" disabled={createLoading}>
          {createLoading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>

      <div className="auth-links">
        <p>
          <Link to="/registration">← Назад к выбору роли</Link>
        </p>
        <p>
          Уже есть аккаунт? <Link to="/authorisation">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default ParentRegistr;
