import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../ui/button/Button";

const WelcomeAuth = ({ user }) => {
  return (
    <>
      <div>
        <h1 className="home-h1">Добро пожаловать,</h1>
        <h2>
          {user.name} {user.surname}
        </h2>
        <h3>Ваши действия:</h3>
        <nav>
          🢂<Link to="/class-list"> Перейти к классам</Link>
          🢂<Link to="/grades-list">📝 Просмотр оценок</Link>
        </nav>
      </div>
    </>
  );
};
export default WelcomeAuth;
