import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../../services/api";
import Input from "../../../ui/input/Input";
import Button from "../../../ui/button/Button";
import "./auth.scss";

const Authorisation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState({
    login: "",
    password: "",
  });

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
    let isValid = true;
    const newError = {
      login: "",
      password: "",
    };
    if (!formData.login.trim()) {
      newError.login = "Введите логин!";
      isValid = false;
    }
    if (!formData.password) {
      newError.password = "Введите пароль!";
      isValid = false;
    }
    setError(newError);
    return isValid;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const user = await api.login(formData.login, formData.password);
      if (!user) {
        setError({
          login: "Неверный логин",
          password: "Неверный пароль",
        });
        return;
      }
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", "user-token-" + user.id);
      navigate("/class-list");
    } catch (error) {
      setError({
        login: "Ошибка сервера",
        password: "Попробуйте позже!",
      });
    }
  };
  return (
    <div className="auth-container">
      <h1 className="auth-title">Вход в систему</h1>

      <form onSubmit={handleAuth} className="auth-form">
        <label className="form-label">Логин</label>
        <Input
          type="text"
          name="login"
          value={formData.login}
          onChange={handleInputChange}
          placeholder="Введите ваш логин"
          error={!!error.login}
          required
        />
        {error.login && <span className="error-message">{error.login}</span>}

        <label className="form-label">Пароль</label>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Введите ваш пароль"
          error={!!error.password}
          required
        />
        {error.password && (
          <span className="error-message">{error.password}</span>
        )}
        <Button size="normal"> Войти </Button>
        <p className="auth-link">
          Нет аккаунта? <Link to="/registration">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
};

export default Authorisation;
