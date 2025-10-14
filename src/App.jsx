import React from "react";
import { Outlet } from "react-router-dom";

const App = () => {
  console.log("🔵 App component rendered");
  return (
    <div className="App">
      <Outlet />
    </div>
  );
};

export default App;
