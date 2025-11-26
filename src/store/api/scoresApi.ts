import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "./usersApi";

export interface Score {
  id: string;
  studentId?: string;
  teacherId?: string;
  subject?: string;
  class: string;
  score: number | string;
  date: string;
  type: string;
  comment: string;
}

export const scoresApi = createApi({
  reducerPath: "scoresApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/",
  }),
  tagTypes: ["Score"],
  endpoints: (builder) => ({
    // 📝 Создать оценку (аналог createScore)
    createScore: builder.mutation<Score, Omit<Score, "id">>({
      query: (score) => ({
        url: "scores",
        method: "POST",
        body: score,
      }),
      invalidatesTags: ["Score"],
    }),

    // 📊 Получить все оценки
    getScores: builder.query<Score[], void>({
      query: () => "scores",
      providesTags: ["Score"],
    }),

    // 🎯 Получить оценки по studentId (аналог getScoreByStudentId)
    getScoreByStudentId: builder.query<Score[], string>({
      query: (studentId) => "scores",
      transformResponse: (response: Score[], meta, studentId) => {
        console.log("🔍 getScoreByStudentId вызван с studentId:", studentId);
        console.log("📋 Все оценки из базы:", response);

        const scoresArray = Array.isArray(response) ? response : [];

        // УНИВЕРСАЛЬНАЯ ФИЛЬТРАЦИЯ для смешанных ID (как у вас)
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
          studentId: score.studentId?.toString(),
          teacherId: score.teacherId?.toString(),
        }));
      },
      providesTags: ["Score"],
    }),

    getScoreByParentId: builder.query<Score[], string>({
      queryFn: async (parentId, api, extraOptions, baseQuery) => {
        try {
          // 1. Получаем данные родителя
          const parentResult = await baseQuery(`users/${parentId}`);
          if (parentResult.error) throw new Error("Родитель не найден");

          const parentData = parentResult.data as User;
          const childrenIds = parentData.children?.map(String) || [];

          if (childrenIds.length === 0) {
            return { data: [] }; // Нет детей - нет оценок
          }

          // 2. Получаем ВСЕ оценки
          const scoresResult = await baseQuery("scores");
          if (scoresResult.error) throw new Error("Ошибка загрузки оценок");

          const allScores = (scoresResult.data as Score[]) || [];

          // 3. Фильтруем оценки по ID детей
          const filteredScores = allScores.filter((score) =>
            childrenIds.includes(score.studentId?.toString() || "")
          );

          return { data: filteredScores };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: ["Score"],
    }),

    // 👩‍🏫 Получить оценки для учителя (аналог getScoreForTeacher)
    getScoreForTeacher: builder.query<Score[], string>({
      queryFn: async (teacherId, api, extraOptions, baseQuery) => {
        try {
          // Получаем данные учителя
          const teacherResult = await baseQuery(`users/${teacherId}`);
          if (teacherResult.error) throw new Error("Учитель не найден");

          const teacherData = teacherResult.data as User;

          // Получаем всех пользователей
          const usersResult = await baseQuery("users");
          const allUsers = (usersResult.data as User[]) || [];

          // Фильтруем студентов учителя
          const allStudents = allUsers.filter(
            (user) =>
              user.role === "student" &&
              teacherData.classes?.includes(user.class || "")
          );

          const studentsIds = allStudents
            .map((student) => student.id || "")
            .filter((id) => id);

          // Получаем все оценки
          const scoresResult = await baseQuery("scores");
          const allScores = (scoresResult.data as Score[]) || [];

          // Фильтруем оценки по subject и students
          const teacherScoresForSubject = allScores.filter((score) => {
            const matchesSubject = score.subject === teacherData.subject;
            const isForTeachersStudent = studentsIds.includes(
              score.studentId || ""
            );
            return matchesSubject && isForTeachersStudent;
          });

          return { data: teacherScoresForSubject };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["Score"],
    }),

    // ✏️ Обновить оценку (аналог updateScore)
    updateScore: builder.mutation<
      Score,
      { scoreId: string; updatedData: Partial<Score> }
    >({
      query: ({ scoreId, updatedData }) => ({
        url: `scores/${scoreId}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Score"],
    }),

    // 🗑️ Удалить оценку (аналог deleteScore)
    deleteScore: builder.mutation<void, string>({
      query: (scoreId) => ({
        url: `scores/${scoreId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Score"],
    }),
  }),
});

export const {
  useCreateScoreMutation,
  useGetScoresQuery,
  useGetScoreByStudentIdQuery,
  useGetScoreByParentIdQuery,
  useGetScoreForTeacherQuery,
  useUpdateScoreMutation,
  useDeleteScoreMutation,
} = scoresApi;
