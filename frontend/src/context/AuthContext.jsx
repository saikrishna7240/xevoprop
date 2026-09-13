import { createContext, useContext, useState } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("xevoprop_user")) || null; } catch { return null; }
  });

  const login = (data) => {
    const nextUser = data?.user || data;
    if (data?.token) localStorage.setItem("token", data.token);
    localStorage.setItem("xevoprop_user", JSON.stringify(nextUser));
    localStorage.setItem("userId", String(nextUser.id));
    setUser(nextUser);
  };

  const refreshUser = async () => {
    try { const data = await apiFetch("/auth/me"); login({ user: data.user }); return data.user; } catch { return null; }
  };

  const logout = () => {
    setUser(null);
    ["token","xevoprop_user","userId","username"].forEach(k => localStorage.removeItem(k));
  };

  return <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoggedIn: !!user }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
