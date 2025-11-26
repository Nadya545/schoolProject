import { useEffect } from "react";
import { useGetStudentsQuery } from "../../../store/api/usersApi";
import { useAppDispatch } from "../../../store/hooks";
import { updateStudentCards } from "../../../store/slices/studentsSlice";
import { StudentCard } from "../../../types/studentType";
import { cardsStudentsData } from "../../../constants/cartStudents";

export const useStudentsSync = () => {
  const dispatch = useAppDispatch();
  const { data: studentsFromApi, isLoading, error } = useGetStudentsQuery();

  useEffect(() => {
    // 🔄 СОЗДАЕМ ГЛУБОКУЮ КОПИЮ статических данных
    const staticCardsCopy = cardsStudentsData.map((card) => ({
      ...card,
      students: [...card.students], // Копируем массив студентов
    }));

    const classesMap = new Map<string, StudentCard>();

    // 1. 📚 Добавляем копию статических данных
    staticCardsCopy.forEach((staticCard) => {
      const key = `${staticCard.number}-${staticCard.letter}`;
      classesMap.set(key, { ...staticCard });
    });

    // 2. 🗄️ Добавляем/объединяем данные из БД
    if (studentsFromApi && studentsFromApi.length > 0) {
      studentsFromApi.forEach((student) => {
        if (student.role !== "student" || !student.class) return;

        const className = student.class;
        const numberMatch = className.match(/\d+/);
        const letterMatch = className.match(/[А-ЯЁа-яё]+/);

        const number = numberMatch ? parseInt(numberMatch[0]) : 0;
        const letter = letterMatch ? letterMatch[0] : "А";
        const key = `${number}-${letter}`;

        // Если класс уже есть - добавляем студентов
        if (classesMap.has(key)) {
          const existingCard = classesMap.get(key)!;

          // 🔄 СОЗДАЕМ НОВЫЙ МАССИВ вместо изменения существующего
          const studentExists = existingCard.students.some(
            (s) => s.id.toString() === student.id.toString()
          );

          if (!studentExists) {
            // 🔄 СОЗДАЕМ НОВЫЙ ОБЪЕКТ с обновленным массивом студентов
            classesMap.set(key, {
              ...existingCard,
              students: [
                ...existingCard.students,
                {
                  id: student.id,
                  name: student.name || "",
                  surname: student.surname || "",
                },
              ],
            });
          }
        } else {
          // Создаем новый класс
          classesMap.set(key, {
            id: `class-${key}`,
            number,
            letter,
            students: [
              {
                id: student.id,
                name: student.name || "",
                surname: student.surname || "",
              },
            ],
          });
        }
      });
    }

    const mergedCards = Array.from(classesMap.values());
    console.log("📚 Объединенные данные студентов:", mergedCards);

    // Обновляем Redux
    dispatch(updateStudentCards(mergedCards));
  }, [studentsFromApi, dispatch]);

  return { isLoading, error };
};
