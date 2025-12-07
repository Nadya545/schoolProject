import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface User {
  id: string;
  login: string;
  password: string;
  name?: string;
  surname?: string;
  role: "teacher" | "parent" | "student";
  subject?: string;
  classes?: string[];
  children?: number[];
  class?: string;
}

export const usersApi = createApi({
  reducerPath: "usersApi", // уникальное имя для хранения в Redux
  baseQuery: fetchBaseQuery({
    //готовый инструмент для HTTP запросов
    baseUrl: "http://localhost:3001/",
  }),
  tagTypes: ["User"], //метки для автоматического обновления данных
  endpoints: (builder) => ({
    // конечные точки-мои запросы
    login: builder.mutation<
      User /*что вернется при успехе*/,
      { login: string; password: string } /*что нужно отправить*/
    >({
      //вход в систему
      query: (credentials) => ({
        url: "users",
        method: "GET",
        params: {
          login: credentials.login,
          password: credentials.password,
        },
      }),
      transformResponse: (response: User[]) => {
        const user = response[0] || null;
        if (user) {
          return {
            ...user,
            children: user.children ? user.children.map(Number) : undefined,
          };
        }
        throw new Error("Пользователь не найден");
      },
    }),

    getUsers: builder.query<User[], void>({
      query: () => "users",
      providesTags: ["User"],
    }),

    getStudents: builder.query<User[], void>({
      query: () => "users?role=student",
      providesTags: ["User"],
    }),

    getUserByLogin: builder.query<User | null, string>({
      query: (login) => `users?login=${login}`,
      transformResponse: (response: User[]) => {
        const user = response[0];
        if (user) {
          return {
            ...user,
            children: user.children ? user.children.map(Number) : undefined,
          };
        }
        return null;
      },
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}`,
    }),

    getNextStudentId: builder.mutation<string, void>({
      query: () => "users",
      transformResponse: (response: User[]) => {
        const students = response.filter((user) => user.role === "student");

        const numericIds = students
          .map((student) => {
            const match = student.id.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter((id) => id > 0);

        const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 16;
        return `student${nextId}`;
      },
    }),

    createUser: builder.mutation<User, Omit<User, "id">>({
      query: (user) => ({
        url: "users",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["User"], // 🔄 Автоматически обновляет списки пользователей
    }),

    updateUser: builder.mutation<User, { id: string; updates: Partial<User> }>({
      query: ({ id, updates }) => ({
        url: `users/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});
export const {
  useLoginMutation,
  useGetUsersQuery,
  useGetStudentsQuery,
  useGetUserByLoginQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetNextStudentIdMutation,
} = usersApi;
