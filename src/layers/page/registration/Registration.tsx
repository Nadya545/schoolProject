import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";
import "./reg-roles.scss";

const Registration = () => {
  const navigate = useNavigate();

  const handleTeacherReg = () => {
    navigate("/registration/teacher");
  };

  const handleParentReg = () => {
    navigate("/registration/parent");
  };

  const handleStudentReg = () => {
    navigate("/registration/student");
  };

  return (
    <div className="reg-container">
      <h1 className=" reg-title">Зарегистрируйтесь как:</h1>

      <div className="roles">
        <Button size="normal" onClick={handleTeacherReg}>
          Учитель
        </Button>
        <Button size="normal" onClick={handleParentReg}>
          Родитель
        </Button>
        <Button size="normal" onClick={handleStudentReg}>
          Ученик
        </Button>
      </div>
      <div className="auth-links">
        <p>
          Уже есть аккаунт? <Link to="/authorisation">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Registration;
