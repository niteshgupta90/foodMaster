import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
export const AuthContext = createContext();
function restore() {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!token || !user) return {};
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (payload.exp * 1000 <= Date.now()) return {};
    return { token, user };
  } catch {
    return {};
  }
}
export function AuthProvider({ children }) {
  const [session, setSession] = useState(restore);
  const navigate = useNavigate();
  function login(token, user) {
    setSession({ token, user });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
  function clearSession() {
    setSession({});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  function updateUser(user) {
    setSession((current) => ({ ...current, user }));
    localStorage.setItem("user", JSON.stringify(user));
  }
  useEffect(() => {
    if (!session.token) return;
    const abort = new AbortController();
    api
      .get("/auth/me", { signal: abort.signal })
      .then((res) => updateUser(res.data.user))
      .catch((err) => {
        if (!abort.signal.aborted && err.response?.status === 401)
          clearSession();
      });
    return () => abort.abort();
  }, [session.token]);
  function logout() {
    setSession({});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }
  return (
    <AuthContext.Provider
      value={{
        ...session,
        login,
        clearSession,
        updateUser,
        logout,
        isAdmin: () => !!session.user?.isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
