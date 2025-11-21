import { useDispatch } from "react-redux";
import React from "react";
import { useAppSelector } from "../../../store/hooks";
import { updateStudentCards } from "../../../store/slices/studentsSlice";

export const loadStudentsFromDB = async (
  dispatch: any,
  studentCards: any[]
) => {
  try {
    console.log("🔄 Загрузка студентов из базы данных...");

    const response = await fetch("http://localhost:3001/users");
    const allUsers = await response.json();
    const students = allUsers.filter((user: any) => user.role === "student");

    // Создаем структуру классов для Redux из БД
    const dbClassesMap = new Map();

    students.forEach((student: any) => {
      if (!student.class) return;

      const className = student.class;
      const number = parseInt(className);
      const letter = className.replace(number.toString(), "");
      const key = `${number}-${letter}`;

      if (!dbClassesMap.has(key)) {
        dbClassesMap.set(key, {
          id: `db-${key}`,
          number,
          letter,
          students: [],
        });
      }

      dbClassesMap.get(key).students.push({
        id: student.id,
        name: student.name || "",
        surname: student.surname || "",
      });
    });

    const dbStudentCards = Array.from(dbClassesMap.values());

    // Объединяем карточки
    const mergedCardsMap = new Map();

    // Добавляем карточки из Redux
    studentCards.forEach((card) => {
      const key = `${card.number}-${card.letter}`;
      mergedCardsMap.set(key, { ...card, students: [...card.students] });
    });

    // Добавляем карточки из БД
    dbStudentCards.forEach((dbCard) => {
      const key = `${dbCard.number}-${dbCard.letter}`;

      if (mergedCardsMap.has(key)) {
        const existingCard = mergedCardsMap.get(key);

        // Фильтруем студентов из БД, оставляя только тех, кого еще нет в карточке
        const uniqueNewStudents = dbCard.students.filter((dbStudent) => {
          // Проверяем по имени и фамилии (игнорируя регистр)
          const isDuplicate = existingCard.students.some(
            (existingStudent) =>
              existingStudent.name.toLowerCase() ===
                dbStudent.name.toLowerCase() &&
              existingStudent.surname.toLowerCase() ===
                dbStudent.surname.toLowerCase()
          );
          return !isDuplicate;
        });

        mergedCardsMap.set(key, {
          ...existingCard,
          students: [...existingCard.students, ...uniqueNewStudents],
        });
      } else {
        mergedCardsMap.set(key, { ...dbCard });
      }
    });

    const allStudentCards = Array.from(mergedCardsMap.values());
    console.log("📚 Объединенные студенты без дубликатов:", allStudentCards);

    dispatch(updateStudentCards(allStudentCards));
  } catch (error) {
    console.error("❌ Ошибка загрузки студентов:", error);
  }
};
