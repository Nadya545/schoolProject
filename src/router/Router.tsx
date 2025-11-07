import { RouteObject } from "react-router-dom";
import React from "react";
import App from "../App";
import RouterErrorElement from "./RouterErrorElement";

import Welcome from "../layers/page/mainPage/Welcome";
import StudentsList from "../layers/page/student-list/studentsList/StudentsList";
import Authorisation from "../layers/page/auth/Authorisation";
import Registration from "../layers/page/registration/Registration";
import ProtectedRoute from "./ProtectedRouter";
import TeacherRegistr from "../layers/page/registration/teacher/TeacherRegistr";
import ParentRegistr from "../layers/page/registration/parent/ParentRegistr";
import StudentRegistr from "../layers/page/registration/student/StudentRegistr";
import GradesList from "../layers/page/grades/GradesList";

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
        element: (
          <ProtectedRoute>
            <StudentsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "grades-list",
        element: (
          <ProtectedRoute>
            <GradesList />
          </ProtectedRoute>
        ),
      },
      {
        path: "authorisation",
        element: <Authorisation />,
      },
      {
        path: "registration",
        element: <Registration />,
      },
      {
        path: "registration/teacher",
        element: <TeacherRegistr />,
      },
      {
        path: "registration/parent",
        element: <ParentRegistr />,
      },
      {
        path: "registration/student",
        element: <StudentRegistr />,
      },
    ],
  },
];
