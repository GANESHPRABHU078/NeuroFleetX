import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
