import { User } from "../services/api";

export const useGetUser = () => {
  const getCurrentUser = (): User | null => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };
  const isAuthenticated = (): boolean => {
    return !!getCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };
  return { getCurrentUser, isAuthenticated, logout };
};
