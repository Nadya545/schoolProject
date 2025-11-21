import { User } from "../services/api";

export const useGetUser = () => {
  const getCurrentUser = (): User | null => {
    try {
      console.log("🔍 useGetUser - начинаем получение пользователя");
      const userData = localStorage.getItem("user");
      console.log("📁 useGetUser - данные из localStorage:", userData);

      if (!userData) {
        console.log("❌ useGetUser - пользователь не найден в localStorage");
        return null;
      }

      const parsedUser = JSON.parse(userData);
      console.log("✅ useGetUser - пользователь распарсен:", parsedUser);
      return parsedUser;
    } catch (error) {
      console.error("❌ useGetUser - ошибка парсинга:", error);
      return null;
    }
  };

  const isAuthenticated = (): boolean => {
    const authenticated = !!getCurrentUser();
    console.log("🔐 useGetUser - аутентифицирован:", authenticated);
    return authenticated;
  };

  const logout = () => {
    console.log("🚪 useGetUser - выход из системы");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  console.log("🎯 useGetUser hook инициализирован");
  return { getCurrentUser, isAuthenticated, logout };
};
