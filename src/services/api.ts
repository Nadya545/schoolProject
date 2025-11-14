import { StudentCard } from "../types/studentType";

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
  id: string;
  studentId?: number;
  teacherId?: number;
  subject?: string;
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
    console.log("📝 createUser вернул:", userData); // ← добавить
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
      id: scoreData.id, // ✅ Оставляем как string
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

    // ✅ Оставляем ID как string
    return scoresArray.map((score) => ({
      ...score,
      id: score.id, // ✅ string
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

  async getScoreForTeacher(teacherId: number | string): Promise<Score[]> {
    const teacherIdStr = teacherId.toString();
    const teacher = await fetch(`${API_BASE_URL}/users/${teacherIdStr}`);
    if (!teacher.ok) {
      throw new Error("Учитель не найден");
    }
    const teacherData = await teacher.json();

    const allUsers = await fetch(`${API_BASE_URL}/users`);
    const allUsersData = await allUsers.json();
    console.log("👥 Все пользователи:", allUsersData);
    const allStudents = allUsersData.filter((user: User) => {
      return user.role === "student";
    });
    const studentsTeacher = allStudents.filter((student: User) => {
      const isInClass = teacherData.classes.includes(student.class);
      return isInClass;
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
      const matchesSubject = score.subject === teacherData.subject;
      return matchesSubject;
    });

    return teacherScoresForSubject;
  },

  async getScoreForTeacherFromRedux(
    teacherId: number | string,
    studentCards: StudentCard[]
  ): Promise<Score[]> {
    try {
      const teacherResponse = await fetch(`${API_BASE_URL}/users/${teacherId}`);
      const teacherData = await teacherResponse.json();

      const scoresResponse = await fetch(`${API_BASE_URL}/scores`);
      const allScores = await scoresResponse.json();

      const teacherStudentIds = studentCards.flatMap((card: StudentCard) => {
        const cardClassName = `${card.number}${card.letter}`;
        if (teacherData.classes.includes(cardClassName)) {
          return card.students.map((student) => student.id);
        }
        return [];
      });

      const teacherScores = allScores.filter((score: Score) => {
        const scoreThisTeacher = score.teacherId === teacherId;
        const isForTeachersStudent = teacherStudentIds.includes(
          Number(score.studentId)
        );
        const matchesSubject = score.subject === teacherData.subject;
        return scoreThisTeacher && isForTeachersStudent && matchesSubject;
      });

      console.log(`📊 Найдено оценок: ${teacherScores.length}`);

      // ✅ Оставляем ID как string
      return teacherScores.map((score: any) => ({
        ...score,
        id: score.id, // ✅ string
        studentId: Number(score.studentId),
        teacherId: Number(score.teacherId),
        score: Number(score.score),
      }));
    } catch (error) {
      console.error("Ошибка в getScoreForTeacherFromRedux:", error);
      throw error;
    }
  },

  async updateScore(
    scoreId: string, // ✅ Меняем на string
    updatedData: Partial<Score>
  ): Promise<Score> {
    const findScore = await fetch(`${API_BASE_URL}/scores/${scoreId}`);
    if (!findScore.ok) {
      throw new Error("Нет оценок!");
    }
    const findScoreData = await findScore.json();
    const updatedScore = { ...findScoreData, ...updatedData };

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
      id: updatedScoreData.id, // ✅ string
      studentId: Number(updatedScoreData.studentId),
      teacherId: Number(updatedScoreData.teacherId),
    };
  },

  async deleteScore(scoreId: string): Promise<Score> {
    // ✅ Меняем на string
    console.log("🔍 ID для удаления:", scoreId);

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
      id: findScoreData.id, // ✅ string
      studentId: Number(findScoreData.studentId),
      teacherId: Number(findScoreData.teacherId),
    };
  },
};
