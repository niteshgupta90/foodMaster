import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
export default function ProtectedRoute({ children }) {
  return useContext(AuthContext).token ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
