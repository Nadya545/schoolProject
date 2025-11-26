import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../../ui/input/Input";
import Button from "../../../ui/button/Button";
import { useLoginMutation } from "../../../store/api/usersApi"; // Измените на useLazyLoginQuery
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

  // 🎯 Используем ленивый запрос для авторизации
  const [login, { data: user, isLoading, error: loginError }] =
    useLoginMutation();

  // 👀 Следим за успешной авторизацией
  useEffect(() => {
    if (user) {
      console.log("✅ Пользователь авторизован:", user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", "user-token-" + user.id);
      navigate("/");
    }
  }, [user, navigate]);

  // 👀 Следим за ошибками авторизации
  useEffect(() => {
    if (loginError) {
      console.error("❌ Ошибка авторизации:", loginError);
      setError({
        login: "Неверный логин или пароль",
        password: "Неверный логин или пароль",
      });
    }
  }, [loginError]);

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

    if (isLoading) {
      return;
    }

    try {
      await login({
        login: formData.login,
        password: formData.password,
      }).unwrap();
    } catch (error) {
      console.error("❌ Ошибка при запросе авторизации:", error);
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
          disabled={isLoading}
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
          disabled={isLoading}
        />
        {error.password && (
          <span className="error-message">{error.password}</span>
        )}

        <Button size="normal" type="submit" disabled={isLoading}>
          {isLoading ? "Вход..." : "Войти"}
        </Button>

        <p className="auth-link">
          Нет аккаунта? <Link to="/registration">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
};

export default Authorisation;
