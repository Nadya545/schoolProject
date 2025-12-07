import React from "react";
import { Link } from "react-router-dom";

const WelcomeGuest = () => {
  return (
    <>
      <h1 className="home-h1">Добро пожаловать в школьную систему!</h1>
      <p className="home-p">
        Здесь вы можете просматривать классы учеников, оценки и многое другое.
      </p>
      <nav>
        <Link to="/authorisation">🢂 Войти в систему</Link>
      </nav>
    </>
  );
};
export default WelcomeGuest;
