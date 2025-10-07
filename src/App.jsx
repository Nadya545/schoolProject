import { useState } from "react";
import "./App.css";
import CardsContainer from "./layers/CardsContainer";

function App() {
  const cardsStudents = [
    {
      id: 1,
      letter: "A",
      number: 3,
      students: [
        { id: 1, name: "Петр", surname: "Поветкин" },
        { id: 2, name: "Николай", surname: "Мишин" },
        { id: 3, name: "Ольга", surname: "Клюева" },
      ],
    },
    {
      id: 2,
      letter: "Б",
      number: 3,
      students: [
        { id: 4, name: "Василий", surname: "Иванов" },
        { id: 5, name: "Кирилл", surname: "Петров" },
        { id: 6, name: "Лариса", surname: "Никифоровна" },
      ],
    },
    {
      id: 3,
      letter: "А",
      number: 10,
      students: [
        { id: 7, name: "Егор", surname: "Клейменов" },
        { id: 8, name: "Арина", surname: "Светлакова" },
        { id: 9, name: "Богдан", surname: "Нежин" },
      ],
    },
    {
      id: 4,
      letter: "Б",
      number: 10,
      students: [
        { id: 10, name: "Марина", surname: "Кондурова" },
        { id: 11, name: "Павел", surname: "Дуров" },
        { id: 12, name: "Надежда", surname: "Островянская" },
      ],
    },
  ];

  const [studentCards, setStudentCards] = useState(cardsStudents);
  const [inputEvent, setInputEvent] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]); //массив обьектов

  const getMoveForId = (selectedStudents, targetCardIndex, cards) => {
    /*1)СОБИРАЮ ТОВАРЫ В itemsToMove для перемещения*/

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

    /*УДАЛЯЮ ВЫБРАННЫЕ ТОВАРЫ ИЗ копии карточек
  т.е. создаю карточки без этих товаров*/
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

  const handleMoveStudents = (index) => {
    const newStudentCards = getMoveForId(selectedStudents, index, studentCards); //достаю  newCards: и  movedStudents
    setStudentCards(newStudentCards.newCards);
    const remainStudents = selectedStudents.filter((student) => {
      const wasMove = newStudentCards.movedStudents.some((moveStudent) => {
        return moveStudent.id === student.id;
      });
      return !wasMove;
    });
    setSelectedStudents(remainStudents);
    console.log("Перемещенные:", newStudentCards.movedStudents);
    console.log("Остались выбранными:", remainStudents);
  };

  return (
    <div className="App">
      <CardsContainer
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
        handleMoveStudents={handleMoveStudents}
        studentCards={studentCards}
        inputEvent={inputEvent}
        setInputEvent={setInputEvent}
      />
    </div>
  );
}

export default App;
