import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/authorisation" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
