import React from "react";
import { useState } from "react";
import "../App.css";
import CardsContainer from "./CardsContainer";
import { handleStudents } from "../hooks/useMyBigHook";
import { useNavigate } from "react-router-dom";
import {
  Student,
  StudentCard,
  SelectedStudent,
  MoveStudentsResult,
} from "../interfaces/interfaces";
import { Group } from "../interfaces/interfaces";

function ClassList() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const cardsStudents: StudentCard[] = [
    {
      id: 1,
      letter: "А",
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

  const groupCards = (arr: StudentCard[]) => {
    const groups = arr.reduce(
      (group: { [key: number]: StudentCard[] }, card: StudentCard) => {
        const number = card.number;
        if (!group[number]) {
          group[number] = [];
        }
        group[number].push(card);
        return group;
      },
      {}
    );
    return groups;
  };

  /*{
  3: [
    {id:1, number:3, letter:"А", students: [...]},
    {id:2, number:3, letter:"Б", students: [...]}
  ],
  10: [
    {id:3, number:10, letter:"А", students: [...]},
    {id:4, number:10, letter:"Б", students: [...]}
  ]
}*/

  const groupSortNumber = (arr: Group) => {
    const sort = Object.keys(arr)
      .map(Number)
      .sort((a, b) => {
        return a - b;
      });

    return sort;
  };

  const [studentCards, setStudentCards] = useState(cardsStudents);
  const [inputEventName, setInputEventName] = useState("");
  const [inputEventSurname, setInputEventSurname] = useState("");

  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>(
    []
  ); //массив обьектов

  const [numberSelect, setNumberSelect] = useState("");
  const [letterSelect, setLetterSelect] = useState("");

  const { handleMoveStudentsById, createNewStudents } = handleStudents(
    studentCards,
    setStudentCards
  );

  const handleClickBtn = (
    inputEventName: string,
    inputEventSurname: string,
    numberSelect: string,
    letterSelect: string
  ) => {
    if (numberSelect === "") {
      ("Выберете номер класса!");
      return;
    }
    const numberSelectAsNumber = Number(numberSelect);
    console.log("inputEventName перед вызовом:", inputEventName);
    console.log("inputEventSurname перед вызовом:", inputEventSurname);
    console.log("numberSelect перед вызовом:", numberSelect);
    console.log("letterSelect перед вызовом:", letterSelect);
    createNewStudents(
      inputEventName,
      inputEventSurname,
      numberSelectAsNumber,
      letterSelect
    );
    setInputEventName("");
    setInputEventSurname("");
    setNumberSelect("");
    setLetterSelect("");
  };

  const handleMoveStudents = (index: number) => {
    const newStudentCards = handleMoveStudentsById(
      selectedStudents,
      index,
      studentCards,
      numberSelect,
      letterSelect
    ); //достаю  newCards: и  movedStudents

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
    <div className="ClassList">
      <CardsContainer
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
        handleMoveStudents={handleMoveStudents}
        studentCards={studentCards}
        inputEventName={inputEventName}
        setInputEventName={setInputEventName}
        inputEventSurname={inputEventSurname}
        setInputEventSurname={setInputEventSurname}
        handleClickBtn={handleClickBtn}
        numberSelect={numberSelect}
        setNumberSelect={setNumberSelect}
        letterSelect={letterSelect}
        setLetterSelect={setLetterSelect}
        handleLogout={handleLogout}
        groupCards={groupCards}
        groupSortNumber={groupSortNumber}
      />
    </div>
  );
}

export default ClassList;
