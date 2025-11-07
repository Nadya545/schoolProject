import React from "react";
import { Link } from "react-router-dom";
import "./welcome.scss";
const Welcome = () => {
  return (
    <div className="home">
      <h1 className="home-h1">Добро пожаловать в школьную систему!</h1>
      <p className="home-p">
        Здесь вы можете просматривать классы, оценки и многое другое
      </p>
      <div className="opportunities">
        <h3>Возможности:</h3>
        <nav>
          🢂<Link to="/class-list"> Перейти к классам</Link>
          🢂<Link to="/grades-list">📝 Просмотр оценок</Link>
          🢂<Link to="/authorisation">📝 Войти в систему</Link>
        </nav>
      </div>
    </div>
  );
};

export default Welcome;
