import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../../../services/api";
import Input from "../../../../ui/input/Input";
import Button from "../../../../ui/button/Button";
import { useDispatch } from "react-redux";
import { addStudent } from "../../../../store/slices/studentsSlice";
import "./student-reg.scss";

const StudentRegistr = () => {
  const navigate = useNavigate();

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

  const dispatch = useDispatch();

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
    setError(newError);
    return isValid;
  };

  const checkLoginUnique = async (login: string): Promise<boolean> => {
    try {
      const existingUser = await api.getUserByLogin(login);
      return !existingUser;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const loginUnique = await checkLoginUnique(formData.login);
      if (!loginUnique) {
        setError((prev) => ({ ...prev, login: "Данный логин уже занят!" }));
        return;
      }
      const newStudent = {
        login: formData.login,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        role: "student" as const,
        class: formData.class,
      };

      const createdUser = await api.createUser(newStudent);

      dispatch(
        addStudent({
          name: formData.name,
          surname: formData.surname,
          class: formData.class,
          id: createdUser.id,
        })
      );

      navigate("/authorisation");
    } catch (error) {
      setError((prev) => ({
        ...prev,
        login: "Ошибка сервера, попробуйте позже.",
      }));
    }
  };
  return (
    <div className="student-reg-container">
      <h1 className="student-reg-title">Регистрация ученика</h1>
      <form className="student-reg-form" onSubmit={handleSubmit}>
        <Input
          type="text"
          name="login"
          value={formData.login}
          placeholder="Придумайте логин..."
          onChange={handleInputChange}
          error={!!error.login}
          required
        />
        {error.login && <span className="error-message">{error.login}</span>}
        <Input
          type="text"
          name="password"
          value={formData.password}
          placeholder="Придумайте пароль..."
          onChange={handleInputChange}
          error={!!error.password}
          required
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
        />
        {error.surname && (
          <span className="error-message">{error.surname}</span>
        )}
        <Input
          type="text"
          name="class"
          value={formData.class}
          placeholder="Наприме 5А или 10Б"
          onChange={handleInputChange}
          error={!!error.class}
          required
        />
        {error.class && <span className="error-message">{error.class}</span>}

        <Button size="normal" type="submit">
          Зарегистрироваться
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
