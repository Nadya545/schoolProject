const API_BASE_URL = "http://localhost:3001";

export interface User {
  login: string;
  password: string;
  name?: string;
  role: "teacher" | "parent" | "student";
  id?: number;

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
    return response.json();
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
    return Array.isArray(users) ? users[0] || null : null;
  },

  async getUserByLogin(login: string): Promise<User | undefined> {
    const response = await fetch(`${API_BASE_URL}/users?login=${login}`);
    if (!response.ok) {
      throw new Error("Ошибка при поиске пользователя");
    }
    const users = await response.json();
    return users[0];
  },
};
