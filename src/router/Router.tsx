import { RouteObject } from "react-router-dom";
import React from "react";
import App from "../App";
import RouterErrorElement from "./RouterErrorElement";

import Welcome from "../layers/page/auth/mainPage/Welcome";
import StudentsList from "../layers/components/studentsList/StudentsList";

export const Router: RouteObject[] = [
  {
    path: "/",
    element: <App />, //обертка

    errorElement: <RouterErrorElement />,
    children: [
      {
        index: true, // главная
        element: <Welcome />,
      },
      {
        path: "class-list",
        element: <StudentsList />,
      },
    ],
  },
];
