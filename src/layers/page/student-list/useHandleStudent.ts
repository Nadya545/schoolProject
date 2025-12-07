import { apiUser } from "../../../constants/apiConst";
import { usersApi } from "../../../store/api/usersApi";
import {
  Student,
  StudentCard,
  SelectedStudent,
  MoveStudentsResult,
} from "../../../types/studentType";

export const handleStudents = (
  studentCards: StudentCard[],
  setStudentCards: React.Dispatch<React.SetStateAction<StudentCard[]>>,
  createUserMutation?: any,
  getNextStudentIdFn?: () => Promise<string>
) => {
  const createNewStudents = async (
    str1: string,
    str2: string,
    num: number,
    lett: string
  ) => {
    console.log("=== НАЧАЛО createNewStudents ===");
    console.log("📝 Параметры функции:", { str1, str2, num, lett });

    if (!str1 || (str1.trim() === "" && !str2) || str2.trim() === "") {
      alert("Введите данные ученика!");
      return;
    }

    const newNum = Number(num);
    const newLetter = lett.toUpperCase();
    console.log("🔢 Преобразованные параметры:", { newNum, newLetter });

    const getIdStudent = async () => {
      try {
        console.log("🆔 Начало генерации ID...");
        if (getNextStudentIdFn) {
          console.log("🚀 Используем RTK Query для генерации ID");
          const generatedId = await getNextStudentIdFn();
          console.log("🎯 Сгенерированный ID через RTK:", generatedId);
          return generatedId;
        }
        console.log("🔄 Используем старый метод fetch для генерации ID");
        const response = await fetch(apiUser);
        console.log("📡 Получен ответ от /users, статус:", response.status);

        const allUsers = await response.json();
        console.log("👥 Всего пользователей:", allUsers.length);

        const students = allUsers.filter(
          (user: any) => user.role === "student"
        );
        console.log("🎓 Найдено студентов:", students.length);

        // Генерируем строковый ID в формате "studentXX"
        const numericIds = students
          .map((s: any) => {
            const match = s.id.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter((id) => id > 0);

        console.log("🔢 Числовые ID студентов:", numericIds);

        const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 16;
        const generatedId = `student${nextId}`;

        console.log("🎯 Сгенерированный ID:", generatedId);
        return generatedId;
      } catch (error) {
        console.error("❌ Ошибка получения ID:", error);
        const fallbackId = `student${Date.now()}`;
        console.log("🔄 Используем fallback ID:", fallbackId);
        return fallbackId;
      }
    };

    const newId = await getIdStudent();
    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    const newStudent: Student = {
      id: newId,
      name: capitalize(str1),
      surname: capitalize(str2),
    };

    console.log("👤 Данные студента для Redux:", newStudent);

    try {
      const studentData = {
        id: newId,
        login: newId,
        password: "123",
        name: capitalize(str1),
        surname: capitalize(str2),
        role: "student" as const,
        class: `${num}${lett.toUpperCase()}`,
      };

      console.log("📤 Отправка данных в БД:", studentData);

      // 🎯 ИСПОЛЬЗУЕМ RTK Query ЕСЛИ ПЕРЕДАЛИ МУТАЦИЮ
      if (createUserMutation) {
        console.log("🚀 Используем RTK Query для создания студента");
        await createUserMutation(studentData).unwrap();
        console.log("✅ Студент создан через RTK Query");
      } else {
        // 👇 Fallback на старый метод (для обратной совместимости)
        console.log("🔄 Используем старый метод fetch");
        const response = await fetch(apiUser, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        });

        console.log("📥 Ответ от сервера:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Ошибка HTTP:", {
            status: response.status,
            errorText: errorText,
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const savedStudent = await response.json();
        console.log("✅ Студент успешно сохранен в БД:", savedStudent);
      }
    } catch (error) {
      console.error("❌ Критическая ошибка сохранения студента в БД:", error);
      throw error; // 👈 Пробрасываем ошибку выше
    }

    console.log("=== ПРОДОЛЖЕНИЕ createNewStudents ===");

    // Обновляем локальный Redux state
    const existingCardIndex = studentCards.findIndex((card) => {
      return card.number === newNum && card.letter === newLetter;
    });

    if (existingCardIndex !== -1) {
      const newStudentsCard = studentCards.map((card, index) => {
        if (existingCardIndex === index) {
          return {
            ...card,
            students: [...card.students, newStudent],
          };
        }
        return card;
      });
      setStudentCards(newStudentsCard);
    } else {
      const createNewCard = {
        id: Date.now().toString(),
        letter: newLetter,
        number: newNum,
        students: [newStudent],
      };
      setStudentCards([...studentCards, createNewCard]);
    }
    console.log("=== КОНЕЦ createNewStudents ===");
  };

  // Обновляем handleMoveStudentsById для работы с string ID
  const handleMoveStudentsById = (
    selectedStudents: SelectedStudent[],
    targetCardIndex: number,
    cards: StudentCard[],
    numberSelect: number,
    letterSelect: string
  ): MoveStudentsResult => {
    const itemsToMove: Student[] = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      for (let j = 0; j < card.students.length; j++) {
        if (
          selectedStudents.some(
            (selectedStudent) => selectedStudent.id === card.students[j].id
          )
        ) {
          itemsToMove.push(card.students[j]);
        }
      }
    }

    if (itemsToMove.length === 0) {
      return {
        newCards: cards.map((card) => ({
          ...card,
          students: [...card.students],
        })),
        movedStudents: [],
        notMovedStudents: [],
      };
    }

    const newCards = cards.map((card) => ({
      ...card,
      students: card.students.filter(
        (student) =>
          !selectedStudents.some(
            (selectedStudent) =>
              selectedStudent.id === student.id &&
              selectedStudent.number === cards[targetCardIndex]?.number
          )
      ),
    }));

    if (targetCardIndex >= newCards.length) {
      const newCard: StudentCard = {
        id: Date.now().toString(),
        number: Number(numberSelect),
        letter: letterSelect,
        students: [...itemsToMove],
      };
      newCards.push(newCard);
      return {
        newCards: newCards,
        movedStudents: itemsToMove,
        notMovedStudents: [],
      };
    }

    let movedStudents: Student[] = [];
    let notMovedStudents: Student[] = [];

    const addItemToMoveInNewCards = newCards.map((card, index) => {
      const numberCard = newCards[targetCardIndex].number;

      if (index === targetCardIndex) {
        const filterItemsToMove = itemsToMove.filter((student) => {
          const selectedStudent = selectedStudents.find(
            (s) => s.id === student.id
          );
          return selectedStudent?.number === numberCard;
        });

        movedStudents = filterItemsToMove;
        notMovedStudents = itemsToMove.filter((student) => {
          const selectedStudent = selectedStudents.find(
            (s) => s.id === student.id
          );
          return selectedStudent?.number !== numberCard;
        });

        return {
          ...card,
          students: [...card.students, ...filterItemsToMove],
        };
      }

      return card;
    });

    return {
      newCards: addItemToMoveInNewCards,
      movedStudents: movedStudents,
      notMovedStudents: notMovedStudents,
    };
  };

  return {
    handleMoveStudentsById,
    createNewStudents,
  };
};
