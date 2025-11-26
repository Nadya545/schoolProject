import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../../../ui/input/Input";
import Button from "../../../../ui/button/Button";
import { useDispatch } from "react-redux";
import { addStudent } from "../../../../store/slices/studentsSlice";
import {
  useCreateUserMutation,
  useGetUserByLoginQuery,
} from "../../../../store/api/usersApi";
import "./student-reg.scss";

const StudentRegistr = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🎯 Используем RTK Query мутации и запросы
  const [createUser, { isLoading: createLoading, error: createError }] =
    useCreateUserMutation();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    name: "",
    surname: "",
    class: "",
  });

  const [error, setError] = useState({
    login: "",
    password: "",
    name: "",
    surname: "",
    class: "",
  });

  // 🔍 Проверяем уникальность логина при изменении
  const { data: existingUser, refetch: checkLogin } = useGetUserByLoginQuery(
    formData.login,
    {
      skip: !formData.login.trim(), // Не делаем запрос если логин пустой
    }
  );

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
      name: "",
      surname: "",
      class: "",
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
    if (!formData.name.trim()) {
      newError.name = "Введите имя!";
      isValid = false;
    }
    if (!formData.surname.trim()) {
      newError.surname = "Введите фамилию!";
      isValid = false;
    }
    if (!formData.class.trim()) {
      newError.class = "Введите номер класса!";
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
      const newStudent = {
        login: formData.login,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        role: "student" as const,
        class: formData.class,
      };

      console.log("📝 Создаем пользователя:", newStudent);

      // 🎯 1. СОЗДАЕМ СТУДЕНТА В БАЗЕ ДАННЫХ через RTK Query
      const createdUser = await createUser(newStudent).unwrap();
      console.log("✅ Пользователь создан в базе:", createdUser);

      // 🎯 2. ДОБАВЛЯЕМ СТУДЕНТА В REDUX
      console.log("🔍 Данные для addStudent:", {
        name: formData.name,
        surname: formData.surname,
        class: formData.class,
        id: createdUser.id,
      });

      dispatch(
        addStudent({
          name: formData.name,
          surname: formData.surname,
          class: formData.class,
          id: createdUser.id,
        })
      );

      console.log("🎯 Студент добавлен в Redux");

      // 3. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
      setTimeout(() => {
        console.log("🔄 Проверка Redux после добавления:");
        if ((window as any).store) {
          const state = (window as any).store.getState();
          const class7A = state.students.studentCards.find(
            (card) => card.number === 7 && card.letter === "А"
          );
          console.log("🔍 Класс 7А в Redux:", class7A);
        }
      }, 500);

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
    <div className="student-reg-container">
      <h1 className="student-reg-title">Регистрация ученика</h1>

      {/* Показываем ошибки RTK Query */}
      {createError && (
        <div className="error-message global-error">
          ❌ Ошибка при создании пользователя
        </div>
      )}

      <form className="student-reg-form" onSubmit={handleSubmit}>
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
          type="password" // 👈 Лучше использовать type="password"
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

        <Input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Введите имя..."
          onChange={handleInputChange}
          error={!!error.name}
          required
          disabled={createLoading}
        />
        {error.name && <span className="error-message">{error.name}</span>}

        <Input
          type="text"
          name="surname"
          value={formData.surname}
          placeholder="Введите фамилию..."
          onChange={handleInputChange}
          error={!!error.surname}
          required
          disabled={createLoading}
        />
        {error.surname && (
          <span className="error-message">{error.surname}</span>
        )}

        <Input
          type="text"
          name="class"
          value={formData.class}
          placeholder="Например 5А или 10Б"
          onChange={handleInputChange}
          error={!!error.class}
          required
          disabled={createLoading}
        />
        {error.class && <span className="error-message">{error.class}</span>}

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

export default StudentRegistr;
