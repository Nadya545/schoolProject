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

export interface Score {
  id: number;
  studentId: number;
  teacherId: number;
  subject: string;
  class: string; //например 6А
  score: number;
  date: string;
  type: string; //"домашняя работа", "контрольная", "устный ответ" и т.д.
  comment: string; //комментарий учителя
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
        id: Number(user.id),
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
        id: Number(user.id),
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

  // методы для оценок:
  async createScore(score: Omit<Score, "id">): Promise<Score> {
    const response = await fetch(`${API_BASE_URL}/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(score),
    });
    if (!response.ok) {
      throw new Error("Ошибка при постановки оценки!");
    }

    const scoreData = await response.json();
    return {
      ...scoreData,
      id: Number(scoreData.id),
      studentId: Number(scoreData.studentId),
      teacherId: Number(scoreData.teacherId),
    };
  },

  async getScoreByStudentId(studentId: number): Promise<Score[]> {
    const response = await fetch(
      `${API_BASE_URL}/scores?studentId=${studentId}`
    );
    if (!response.ok) {
      throw new Error("Ошибка при поиске оценок");
    }
    const scores = await response.json();
    const scoresArray = Array.isArray(scores) ? scores : [];

    // Конвертирую все ID в number для каждой оценки:
    return scoresArray.map((score) => ({
      ...score,
      id: Number(score.id),
      studentId: Number(score.studentId),
      teacherId: Number(score.teacherId),
    }));
  },

  async getScoreByParentId(parentId: number): Promise<Score[]> {
    const parent = await fetch(`${API_BASE_URL}/users/${parentId}`);
    if (!parent.ok) {
      throw new Error("Родитель не найден");
    }
    const parentData = await parent.json();
    const childrenIds = parentData.children
      ? parentData.children.map(Number)
      : [];
    const scoresChildren = childrenIds.map((childId: number) => {
      return api.getScoreByStudentId(childId);
    });
    const allScores = await Promise.all(scoresChildren);
    return allScores.flat();
  },

  async getScoreForTeacher(teacherId: number): Promise<Score[]> {
    const teacher = await fetch(`${API_BASE_URL}/users/${teacherId}`);
    if (!teacher.ok) {
      throw new Error("Учитель не найден");
    }
    const teacherData = await teacher.json();
    const allUsers = await fetch(`${API_BASE_URL}/users`);
    const allUsersData = await allUsers.json();
    const allStudents = allUsersData.filter((user: User) => {
      return user.role === "student";
    });
    const studentsTeacher = allStudents.filter((student: User) => {
      return teacherData.classes.includes(student.class);
    });
    const studentsId = studentsTeacher.map((student: User) => {
      return student.id;
    });
    const scoresForEveryStudent = studentsId.map((id: number) => {
      return api.getScoreByStudentId(id);
    });
    const allScoresArr = await Promise.all(scoresForEveryStudent);
    const allScores = allScoresArr.flat();
    const teacherScoresForSubject = allScores.filter((score) => {
      return score.subject === teacherData.subject;
    });
    return teacherScoresForSubject;
  },

  async updateScore(
    scoreId: number,
    updatedData: Partial<Score>
  ): Promise<Score> {
    const findScore = await fetch(`${API_BASE_URL}/scores/${scoreId}`);
    if (!findScore.ok) {
      throw new Error("Нет оценок!");
    }
    const findScoreData = await findScore.json();
    const updatedScore = { ...findScoreData, ...updatedData };
    //отправляю обновленную оценку на сервер
    const response = await fetch(`${API_BASE_URL}/scores/${scoreId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedScore),
    });

    if (!response.ok) {
      throw new Error("Ошибка при обновлении оценки");
    }
    const updatedScoreData = await response.json();
    return {
      ...updatedScoreData,
      id: Number(updatedScoreData.id),
      studentId: Number(updatedScoreData.studentId),
      teacherId: Number(updatedScoreData.teacherId),
    };
  },

  async deleteScore(scoreId: number): Promise<Score> {
    const findScore = await fetch(`${API_BASE_URL}/scores/${scoreId}`);
    if (!findScore.ok) {
      throw new Error("Оценка не найдена!");
    }
    const findScoreData = await findScore.json();
    const response = await fetch(`${API_BASE_URL}/scores/${scoreId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Ошибка при удалении оценки");
    }
    return {
      ...findScoreData,
      id: Number(findScoreData.id),
      studentId: Number(findScoreData.studentId),
      teacherId: Number(findScoreData.teacherId),
    };
  },
};
