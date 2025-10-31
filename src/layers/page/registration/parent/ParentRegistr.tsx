import { useState } from "react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../../../services/api";
import Input from "../../../../ui/input/Input";
import Button from "../../../../ui/button/Button";
import { useAppSelector } from "../../../../store/hooks";
import "./parent-reg.scss";

const ParentRegistr = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    children: [] as number[],
  });

  const [error, setError] = useState({
    login: "",
    password: "",
    children: "",
  });

  const studentCards = useAppSelector((state) => state.students.studentCards);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  let allStudents = studentCards.flatMap((card) => {
    return card.students.map((student) => ({
      ...student,
      class: `${card.number}${card.letter}`,
    }));
  });

  const searchStudent = allStudents.filter((student) => {
    return `${student.name} ${student.surname}`
      .toLocaleLowerCase()
      .includes(searchQuery.toLocaleLowerCase());
  });

  const handleStudentCheckBox = (studentId: number) => {
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
      const newParent = {
        login: formData.login,
        password: formData.password,
        role: "parent" as const,
        children: selectedStudentIds,
      };
      await api.createUser(newParent);
      navigate("/authorisation");
    } catch (error) {
      setError((prev) => ({
        ...prev,
        login: "Ошибка сервера, попробуйте позже.",
      }));
    }
  };

  return (
    <div className="parent-reg-container">
      <h1 className="parent-reg-title">Регистрация родителя</h1>
      <form className="parent-reg-form" onSubmit={handleSubmit}>
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
          type="password"
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
        <h3 className="choise-student">Выберете ученика</h3>
        <div className="student-list-reg">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск ученика по имени или фамилии..."
          />
          {(searchQuery ? searchStudent : allStudents).map((student) => (
            <div className="student-item" key={student.id}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={() => handleStudentCheckBox(student.id)}
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
export default ParentRegistr;
