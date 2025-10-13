export const handleStudents = (studentCards, setStudentCards) => {
  const createNewStudents = (str1, str2, num, lett) => {
    console.log("=== НАЧАЛО createNewStudents ===");
    console.log("Параметры:", { str1, str2, num, lett });
    if (!str1 || (str1.trim() === "" && !str2) || str2.trim() === "") {
      alert("Введите данные ученика!");
      return;
    }

    const newNum = Number(num);
    const newLetter = lett.toUpperCase();

    const getIdStudent = () => {
      const idStudents = studentCards.flatMap((card) => {
        return card.students;
      });

      const returnId = idStudents.map((el) => {
        return el.id;
      });

      const idsArr = returnId;
      if (idsArr.length !== 0) {
        const maxId = Math.max(...idsArr);
        const newId = maxId + 1;
        return newId;
      } else {
        return 1;
      }
    };
    const newId = getIdStudent();
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const newStudent = {
      id: newId,
      name: capitalize(str1),
      surname: capitalize(str2),
    };

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

  const handleMoveStudentsById = (selectedStudents, targetCardIndex, cards) => {
    /*1)СОБИРАЮ студентов В itemsToMove для перемещения*/

    const itemsToMove = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      /* card = {
    items: [
      {id: 1, title: "Товар 1"},
      {id: 2, title: "Товар 2"}
    ]
  },*/

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
      };
    }

    /*УДАЛЯЮ ВЫБРАННЫЕ студентов ИЗ копии карточек
  т.е. создаю карточки без этих студентов*/
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
      newCards.push({
        students: [...itemsToMove],
      });
      return {
        newCards: newCards,
        movedStudents: itemsToMove,
        notMovedStudents: [],
      };
    }
    let movedStudents = [];
    let notMovedStudents = [];

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
};
