import { useState } from "react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { subjects, availableClasses } from "../constants/constants";
import { api } from "../../../../services/api";
import Input from "../../../../ui/input/Input";
import Button from "../../../../ui/button/Button";
import "./teacher-reg.scss";

const TeacherRegistr = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    name: "",
    subject: "",
    classes: [] as string[],
  });

  const [error, setError] = useState({
    login: "",
    password: "",
    name: "",
    subject: "",
    classes: "",
  });

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

  const handleClass = (classItem: string) => {
    setFormData((prev) => {
      if (prev.classes.includes(classItem)) {
        return {
          ...prev,
          classes: prev.classes.filter((cl) => cl !== classItem),
        };
      } else {
        return {
          ...prev,
          classes: [...prev.classes, classItem],
        };
      }
    });
  };

  const validateForm = () => {
    const newError = {
      login: "",
      password: "",
      name: "",
      subject: "",
      classes: "",
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
      newError.name = "Введите ФИО!";
      isValid = false;
    }
    if (!formData.subject) {
      newError.password = "Выберете предмет!";
      isValid = false;
    }

    if (formData.classes.length === 0) {
      newError.classes = "Выберете хотя бы один класс!";
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
      const newTeacher = {
        login: formData.login,
        password: formData.password,
        name: formData.name,
        role: "teacher" as const,
        subject: formData.subject,
        classes: formData.classes,
      };
      await api.createUser(newTeacher);
      navigate("/authorisation");
    } catch (error) {
      setError((prev) => ({
        ...prev,
        login: "Ошибка сервера, попробуйте позже.",
      }));
    }
  };

  return (
    <div className="teacher-reg-container">
      <h1 className="teacher-reg-title">Регистрация учителя</h1>
      <form className="teacher-reg-form" onSubmit={handleSubmit}>
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
          placeholder="Введите ФИО..."
          onChange={handleInputChange}
          error={!!error.name}
          required
        />
        {error.name && <span className="error-message">{error.name}</span>}

        <select
          name="subject"
          onChange={handleInputChange}
          value={formData.subject}
          className="subject"
          required
        >
          <option className="select-subject" value="">
            Выберете предмет
          </option>
          {subjects.map((sub) => {
            return (
              <option value={sub} key={sub}>
                {sub}
              </option>
            );
          })}
        </select>

        {error.subject && (
          <span className="error-message">{error.subject}</span>
        )}
        <p>Выберете классы:</p>
        <div className="classes">
          {availableClasses.map((classItem) => {
            return (
              <Button
                size="normal"
                type="button"
                key={classItem}
                active={formData.classes.includes(classItem)}
                onClick={() => handleClass(classItem)}
              >
                {classItem}
              </Button>
            );
          })}
        </div>
        {error.classes && (
          <span className="error-message">{error.classes}</span>
        )}
        {formData.classes.length > 0 && (
          <div className="classes-select">
            <div>
              {" "}
              Выбрано:{" "}
              {formData.classes.map((classItem: string, index: number) => (
                <span key={index} className="selected-class-item">
                  {classItem},{""}
                </span>
              ))}
            </div>
          </div>
        )}
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

export default TeacherRegistr;
