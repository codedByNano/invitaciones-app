import { createContext, useContext, useEffect, useState } from "react";
import { api, clearCsrfToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(setAgency)
      .catch(() => setAgency(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    clearCsrfToken();
    const data = await api.login(email, password);
    setAgency(data);
  }

  async function logout() {
    await api.logout().catch(() => {});
    clearCsrfToken();
    setAgency(null);
  }

  return (
    <AuthContext.Provider value={{ agency, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
