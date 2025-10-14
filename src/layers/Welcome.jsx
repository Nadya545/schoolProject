import React from "react";
import { Link } from "react-router-dom";
const Welcome = () => {
  console.log("🟢 Welcome component rendered");
  return (
    <div className="home">
      <h1>Добро пожаловать в школьную систему!</h1>
      <p>Здесь вы можете просматривать классы, оценки и многое другое</p>
      <div className="features">
        <h3>Возможности:</h3>
        <nav>
          🢂<Link to="/class-list"> Перейти к классам</Link>
          <li>👥 Управление учениками</li>
          {/*так как нет пока этих страниц, оставлю списком, потом будут ссылки*/}
          <li>📝 Просмотр оценок</li>
        </nav>
      </div>
    </div>
  );
};

export default Welcome;
