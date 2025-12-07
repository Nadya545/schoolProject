import React, { useLayoutEffect } from "react";
import "./welcome.scss";

import WelcomeAuth from "./WelcomeAuth";
import WelcomeGuest from "./WelcomeGuest";
import Button from "../../../ui/button/Button";

const Welcome = () => {
  const [key, setKey] = React.useState(0);
  const [currentUser, setCurrentUser] = React.useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <>
      <div className="home">
        {currentUser ? (
          <>
            <Button
              size="addAndOut"
              className="btn-class-list"
              onClick={handleLogout}
            >
              Выход
            </Button>
            <div className="opportunitiesAuth">
              <WelcomeAuth user={currentUser} />
            </div>
          </>
        ) : (
          <div className="opportunitiesGuest">
            <WelcomeGuest />
          </div>
        )}
      </div>
    </>
  );
};

export default Welcome;
