import { StudentCard } from "../types/studentType";
import { User, api } from "./api";

const API_BASE_URL = "http://localhost:3001";

export interface Score {
  id: string;
  studentId?: string;
  teacherId?: string;
  subject?: string;
  class: string; //например 6А
  score: number;
  date: string;
  type: string; //"домашняя работа", "контрольная", "устный ответ" и т.д.
  comment: string; //комментарий учителя
}

export const apiForScore = {
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
      id: scoreData.id,
      studentId: scoreData.studentId,
      teacherId: scoreData.teacherId,
    };
  },

  async getScoreByStudentId(studentId: string): Promise<Score[]> {
    console.log("🔍 getScoreByStudentId вызван с studentId:", studentId);

    const response = await fetch(`${API_BASE_URL}/scores`);
    if (!response.ok) {
      throw new Error("Ошибка при поиске оценок");
    }

    const allScores = await response.json();
    console.log("📋 Все оценки из базы:", allScores);

    const scoresArray = Array.isArray(allScores) ? allScores : [];

    // УНИВЕРСАЛЬНАЯ ФИЛЬТРАЦИЯ для смешанных ID
    const studentScores = scoresArray.filter((score) => {
      const scoreStudentId = score.studentId?.toString();
      const searchStudentId = studentId.toString();

      console.log("🔍 Сравниваем:", scoreStudentId, "с", searchStudentId);
      return scoreStudentId === searchStudentId;
    });

    console.log("🎯 Найденные оценки для студента:", studentScores);

    return studentScores.map((score) => ({
      ...score,
      id: score.id,
      studentId: score.studentId?.toString(), // Приводим к строке
      teacherId: score.teacherId?.toString(),
    }));
  },
  async getScoreByParentId(parentId: string): Promise<Score[]> {
    console.log("🔍 getScoreByParentId: parentId =", parentId);

    const parent = await fetch(`${API_BASE_URL}/users/${parentId}`);
    console.log("🔍 Статус запроса родителя:", parent.status);
    if (!parent.ok) {
      throw new Error("Родитель не найден");
    }

    const parentData = await parent.json();
    const childrenIds = parentData.children
      ? parentData.children.map(String)
      : [];

    const scoresChildren = childrenIds.map((childId: string) => {
      return apiForScore.getScoreByStudentId(childId);
    });

    const allScores = await Promise.all(scoresChildren);
    return allScores.flat();
  },

  async getScoreForTeacher(teacherId: string): Promise<Score[]> {
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
      const isInClass = teacherData.classes.includes(student.class);
      return isInClass;
    });

    const studentsId = studentsTeacher
      .map((student: User) => {
        return student.id || ""; //
      })
      .filter((id: string) => id); //

    const scoresForEveryStudent = studentsId.map((id: string) => {
      return apiForScore.getScoreByStudentId(id);
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
    teacherId: string,
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
          return card.students.map((student) => student.id.toString());
        }
        return [];
      });

      const teacherScores = allScores.filter((score: Score) => {
        const scoreThisTeacher = score.teacherId === teacherId;
        const isForTeachersStudent = teacherStudentIds.includes(
          score.studentId || ""
        );
        const matchesSubject = score.subject === teacherData.subject;

        return scoreThisTeacher && isForTeachersStudent && matchesSubject;
      });

      return teacherScores;
    } catch (error) {
      console.error("Ошибка в getScoreForTeacherFromRedux:", error);
      throw error;
    }
  },

  async updateScore(
    scoreId: string,
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
      id: updatedScoreData.id,
      studentId: updatedScoreData.studentId,
      teacherId: updatedScoreData.teacherId,
    };
  },

  async deleteScore(scoreId: string): Promise<Score> {
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
      id: findScoreData.id,
      studentId: findScoreData.studentId,
      teacherId: findScoreData.teacherId,
    };
  },
};
