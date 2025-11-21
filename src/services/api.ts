import { StudentCard } from "../types/studentType";

const API_BASE_URL = "http://localhost:3001";

export interface User {
  login: string;
  password: string;
  name?: string;
  role: "teacher" | "parent" | "student";
  id?: string;

  subject?: string;
  classes?: string[];

  children?: number[];

  class?: string;
}

export const api = {
  async createUser(user: Omit<User, "id">): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error("Ошибка при создании пользователя");
    }
    const userData = await response.json();
    console.log("📝 createUser вернул:", userData);
    return userData;
  },

  async login(login: string, password: string): Promise<User | null> {
    const encodedLogin = encodeURIComponent(login);
    const encodedPassword = encodeURIComponent(password);

    const response = await fetch(
      `${API_BASE_URL}/users?login=${encodedLogin}&password=${encodedPassword}`
    );

    if (!response.ok) {
      throw new Error("Ошибка при авторизации");
    }

    const users = await response.json();
    const user = Array.isArray(users) ? users[0] || null : null;
    if (user) {
      return {
        ...user,
        id: user.id,
        children: user.children ? user.children.map(Number) : undefined,
      };
    }
    return null;
  },

  async getUserByLogin(login: string): Promise<User | undefined> {
    const response = await fetch(`${API_BASE_URL}/users?login=${login}`);
    if (!response.ok) {
      throw new Error("Ошибка при поиске пользователя");
    }
    const users = await response.json();
    const user = users[0];
    if (user) {
      return {
        ...user,
        id: user.id,
        children: user.children ? user.children.map(Number) : undefined,
      };
    }
    return undefined;
  },

  async getUserById(id: number): Promise<User | undefined> {
    const response = await fetch(`${API_BASE_URL}/users/id${id}`);
    if (!response.ok) {
      throw new Error("Ошибка при поиске...");
    }
    const user = await response.json();
    return user;
  },
};
