import {
  Student,
  StudentCard,
  SelectedStudent,
  MoveStudentsResult,
} from "../../../types/studentType";

export const handleStudents = (
  studentCards: StudentCard[],
  setStudentCards: React.Dispatch<React.SetStateAction<StudentCard[]>>
) => {
  const createNewStudents = async (
    str1: string,
    str2: string,
    num: number,
    lett: string
  ) => {
    console.log("Параметры:", { str1, str2, num, lett });
    if (!str1 || (str1.trim() === "" && !str2) || str2.trim() === "") {
      alert("Введите данные ученика!");
      return;
    }

    const newNum = Number(num);
    const newLetter = lett.toUpperCase();

    const getIdStudent = async () => {
      try {
        const response = await fetch("http://localhost:3001/users");
        const allUsers = await response.json();
        const students = allUsers.filter(
          (user: any) => user.role === "student"
        );

        // Генерируем строковый ID в формате "studentXX"
        const numericIds = students
          .map((s: any) => {
            // Извлекаем число из ID типа "student13", "13", "cb81"
            const match = s.id.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter((id) => id > 0);

        // Начинаем с 16, так как 1-15 уже заняты
        const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 16;
        return `student${nextId}`;
      } catch (error) {
        console.error("Ошибка получения ID:", error);
        // Fallback - генерируем случайный ID
        return `student${Date.now()}`;
      }
    };

    const newId = await getIdStudent();
    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    // ID теперь string - как во всех интерфейсах
    const newStudent: Student = {
      id: newId,
      name: capitalize(str1),
      surname: capitalize(str2),
    };

    try {
      await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newId,
          login: newId, // Используем тот же ID как логин
          password: "123",
          name: capitalize(str1),
          surname: capitalize(str2),
          role: "student",
          class: `${num}${lett.toUpperCase()}`,
        }),
      });
      console.log("✅ Студент сохранен в базу данных");
    } catch (error) {
      console.error("❌ Ошибка сохранения студента в БД:", error);
      alert("Ошибка при создании студента!");
      return;
    }

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
        id: Date.now().toString(), // ID карточки тоже string
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

/*import {
  Student,
  StudentCard,
  SelectedStudent,
  MoveStudentsResult,
} from "../types/studentType";

export const handleStudents = (
  studentCards: StudentCard[],
  setStudentCards: React.Dispatch<React.SetStateAction<StudentCard[]>>
) => {
  const createNewStudents = async (
    str1: string,
    str2: string,
    num: number,
    lett: string
  ) => {
    console.log("Параметры:", { str1, str2, num, lett });
    if (!str1 || (str1.trim() === "" && !str2) || str2.trim() === "") {
      alert("Введите данные ученика!");
      return;
    }

    const newNum = Number(num);
    const newLetter = lett.toUpperCase();

    const getIdStudent = async () => {
      try {
        const response = await fetch("http://localhost:3001/users");
        const allUsers = await response.json();
        const students = allUsers.filter(
          (user: any) => user.role === "student"
        );

        // Генерируем случайный строковый ID (как "cb81", "1db0")
        const generateStringId = () => {
          return Math.random().toString(36).substr(2, 4); // Пример: "a1b2"
        };

        let newId;
        let attempts = 0;

        // Убеждаемся, что ID уникален
        do {
          newId = generateStringId();
          attempts++;
        } while (students.some((s: any) => s.id === newId) && attempts < 10);

        return newId;
      } catch (error) {
        console.error("Ошибка получения ID:", error);
        // Fallback - генерируем случайный ID
        return Math.random().toString(36).substr(2, 4);
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
    try {
      await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newId.toString(),
          login: `student${newId}`,
          password: "123",
          name: capitalize(str1),
          surname: capitalize(str2),
          role: "student",
          class: `${num}${lett.toUpperCase()}`,
        }),
      });
      console.log("✅ Студент сохранен в базу данных");
    } catch (error) {
      console.error("❌ Ошибка сохранения студента в БД:", error);
      alert("Ошибка при создании студента!");
      return;
    }
    const existingCardIndex = studentCards.findIndex((card) => {
      return card.number === newNum && card.letter === newLetter;
    });
    console.log("Найдена карточка с индексом:", existingCardIndex);
    if (existingCardIndex !== -1) {
      console.log("Добавляем в существующую карточку");
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
      console.log("Создаем новую карточку");

      const createNewCard = {
        id: Date.now(),
        letter: newLetter,
        number: newNum,
        students: [newStudent],
      };
      setStudentCards([...studentCards, createNewCard]);
    }
    console.log("=== КОНЕЦ createNewStudents ===");
  };

  const handleMoveStudentsById = (
    selectedStudents: SelectedStudent[],
    targetCardIndex: number,
    cards: StudentCard[],
    numberSelect: number,
    letterSelect: string
  ): MoveStudentsResult => {
    /*1)СОБИРАЮ студентов В itemsToMove для перемещения

    const itemsToMove: Student[] = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      

      for (let j = 0; j < card.students.length; j++) {
        if (
          selectedStudents.some((selectedStudent) => {
            return selectedStudent.id === card.students[j].id;
          })
        )
          itemsToMove.push(card.students[j]);
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

    /*УДАЛЯЮ ВЫБРАННЫЕ студентов ИЗ копии карточек
  т.е. создаю карточки без этих студентов
    const newCards = cards.map((card) => {
      return {
        ...card,
        students: card.students.filter((student) => {
          const willBeMoved = selectedStudents.some(
            (selectedStudent) =>
              selectedStudent.id === student.id &&
              selectedStudent.number === cards[targetCardIndex]?.number
          );
          return !willBeMoved;
        }),
      };
    });

    if (targetCardIndex >= newCards.length) {
      const newCard: StudentCard = {
        id: Date.now(),
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
      console.log(numberCard, "НОМЕР КАРТОЧКИ");
      console.log(targetCardIndex);

      if (index === targetCardIndex) {
        const filterItemsToMove = itemsToMove.filter((student) => {
          const selectedStudent = selectedStudents.find((s) => {
            return s.id === student.id;
          });

          return selectedStudent?.number === numberCard;
        });

        console.log(filterItemsToMove);
        movedStudents = filterItemsToMove;
        notMovedStudents = itemsToMove.filter((student) => {
          const selectedStudent = selectedStudents.find(
            (s) => s.id === student.id
          );
          return selectedStudent?.number !== numberCard; // неподходящие
        });
        console.log(notMovedStudents, "НЕ ПЕРЕМЕЩЕННЫЕ");
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
};*/
