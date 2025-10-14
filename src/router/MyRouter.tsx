import { RouteObject } from "react-router-dom";
import React from "react";
import App from "../App";
import RouterErrorElement from "./RouterErrorElement";
import ClassList from "../layers/ClassList";
import Welcome from "../layers/Welcome";

export const MyRouter: RouteObject[] = [
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
        element: <ClassList />,
      },
    ],
  },
];
