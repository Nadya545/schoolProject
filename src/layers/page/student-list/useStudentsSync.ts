import { useEffect } from "react";
import { useGetStudentsQuery } from "../../../store/api/usersApi";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateStudentCards } from "../../../store/slices/studentsSlice";
import { StudentCard } from "../../../types/studentType";
import { cardsStudentsData } from "../../../constants/cartStudents";

export const useStudentsSync = () => {
  const dispatch = useAppDispatch();
  const existingCards = useAppSelector((state) => state.students.studentCards);
  const { data: studentsFromApi, isLoading, error } = useGetStudentsQuery();

  useEffect(() => {
    const mergeAllStudentSources = () => {
      // 1. 🔧 Функция для нормализации ID к строке
      const normalizeId = (id: any): string => {
        if (id === null || id === undefined) return "";
        return String(id);
      };

      // 2. 📚 Создаем Map для объединения (ключ: "номер-буква")
      const classesMap = new Map<string, StudentCard>();

      // 3. 📦 Источник 1: Статические данные из константы
      cardsStudentsData.forEach((staticCard) => {
        const key = `${staticCard.number}-${staticCard.letter}`;

        // Нормализуем ID студентов
        const normalizedStudents = staticCard.students.map((student) => ({
          ...student,
          id: normalizeId(student.id),
        }));

        classesMap.set(key, {
          ...staticCard,
          id: normalizeId(staticCard.id),
          students: normalizedStudents,
        });
      });

      // 4. 🗄️ Источник 2: Существующие данные из Redux
      existingCards.forEach((reduxCard) => {
        const key = `${reduxCard.number}-${reduxCard.letter}`;

        // Нормализуем ID студентов
        const normalizedStudents = reduxCard.students.map((student) => ({
          ...student,
          id: normalizeId(student.id),
        }));

        const existingInMap = classesMap.get(key);

        if (existingInMap) {
          // Объединяем студентов, убирая дубликаты
          const combinedStudents = [...existingInMap.students];

          normalizedStudents.forEach((newStudent) => {
            const isDuplicate = combinedStudents.some(
              (existingStudent) => existingStudent.id === newStudent.id
            );

            if (!isDuplicate) {
              combinedStudents.push(newStudent);
            }
          });

          classesMap.set(key, {
            ...existingInMap,
            students: combinedStudents,
          });
        } else {
          classesMap.set(key, {
            ...reduxCard,
            id: normalizeId(reduxCard.id),
            students: normalizedStudents,
          });
        }
      });

      // 5. 🌐 Источник 3: Данные из API (база данных)
      if (studentsFromApi && studentsFromApi.length > 0) {
        studentsFromApi.forEach((student) => {
          // Фильтруем только студентов с указанным классом
          if (student.role !== "student" || !student.class) return;

          const className = student.class;
          const numberMatch = className.match(/\d+/);
          const letterMatch = className.match(/[А-ЯЁа-яёA-Za-z]+/);

          const number = numberMatch ? parseInt(numberMatch[0]) : 0;
          const letter = letterMatch ? letterMatch[0].toUpperCase() : "А";
          const key = `${number}-${letter}`;

          const normalizedStudent = {
            id: normalizeId(student.id),
            name: student.name || "Неизвестно",
            surname: student.surname || "",
          };

          if (classesMap.has(key)) {
            const existingCard = classesMap.get(key)!;

            // Проверяем дубликаты по ID
            const studentExists = existingCard.students.some(
              (s) => s.id === normalizedStudent.id
            );

            if (!studentExists) {
              classesMap.set(key, {
                ...existingCard,
                students: [...existingCard.students, normalizedStudent],
              });
            }
          } else {
            // Создаем новый класс
            classesMap.set(key, {
              id: `class-${key}`,
              number,
              letter,
              students: [normalizedStudent],
            });
          }
        });
      }

      // 6. 🎯 Преобразуем Map в отсортированный массив
      const mergedCards = Array.from(classesMap.values());

      // Сортируем по номеру и букве класса
      mergedCards.sort((a, b) => {
        if (a.number !== b.number) return a.number - b.number;
        return a.letter.localeCompare(b.letter);
      });

      // 7. 📊 Логирование для отладки
      console.log("📚 Объединенные данные из всех источников:");
      console.log("- Количество классов:", mergedCards.length);

      const totalStudents = mergedCards.reduce(
        (sum, card) => sum + card.students.length,
        0
      );
      console.log("- Всего студентов:", totalStudents);

      // Выводим ID всех студентов для проверки
      console.log("- ID всех студентов:");
      mergedCards.forEach((card, cardIndex) => {
        console.log(`  Класс ${card.number}${card.letter}:`);
        card.students.forEach((student, studentIndex) => {
          console.log(
            `    ${studentIndex + 1}. ID: "${
              student.id
            }" (тип: ${typeof student.id}), ${student.name} ${student.surname}`
          );
        });
      });

      return mergedCards;
    };

    // Выполняем объединение и обновляем Redux
    const mergedCards = mergeAllStudentSources();
    dispatch(updateStudentCards(mergedCards));
  }, [studentsFromApi, dispatch]);

  return { isLoading, error };
};

/*import { useEffect } from "react";
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
*/
