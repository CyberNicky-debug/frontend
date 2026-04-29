import { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, loginUser, registerUser } from "../services/authService";
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  saveSession,
} from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    async function hydrateProfile() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchProfile();
        setUser(response.data);
        saveSession(token, response.data);
      } catch {
        clearSession();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    hydrateProfile();
  }, [token]);

  async function login(credentials) {
    const response = await loginUser(credentials);
    const sessionToken = response.data.token;
    const sessionUser = {
      id: response.data.id,
      email: response.data.email,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      role: response.data.role,
    };

    setToken(sessionToken);
    setUser(sessionUser);
    saveSession(sessionToken, sessionUser);

    return response;
  }

  async function register(payload) {
    const response = await registerUser(payload);
    const sessionToken = response.data.token;
    const sessionUser = {
      id: response.data.id,
      email: response.data.email,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      role: response.data.role || "customer",
    };

    setToken(sessionToken);
    setUser(sessionUser);
    saveSession(sessionToken, sessionUser);

    return response;
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
