import React from "react";
import { useState } from "react";
import "../../App.scss";
import CardsContainer from "./CardsContainer";
import { handleStudents } from "../../hooks/useHandleStudent";
import { useNavigate } from "react-router-dom";
import { StudentCard, SelectedStudent } from "../../types/studentType";
import { Group } from "../../types/studentType";
import { cardsStudentsData } from "../../constants/CartStudents";
import { useAppSelector } from "../../store/hooks";
import {
  updateSelectedStudents,
  updateStudentCards,
} from "../../store/slices/studentsSlice";
import { useDispatch } from "react-redux";

function StudentsList() {
  const dispatch = useDispatch();
  const studentCards = useAppSelector((state) => state.students.studentCards);
  const selectedStudents = useAppSelector(
    (state) => state.students.selectedStudents
  );

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const cardsStudents: StudentCard[] = cardsStudentsData;

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

  const groupSortNumber = (arr: Group) => {
    const sort = Object.keys(arr)
      .map(Number)
      .sort((a, b) => {
        return a - b;
      });

    return sort;
  };

  const [inputEventName, setInputEventName] = useState("");
  const [inputEventSurname, setInputEventSurname] = useState("");
  const [numberSelect, setNumberSelect] = useState<number>(0);
  const [letterSelect, setLetterSelect] = useState("");
  /* const [studentCards, setStudentCards] = useState(cardsStudents); redux */
  /*const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>(
    []
  ); //массив обьектов redux*/

  const { handleMoveStudentsById, createNewStudents } = handleStudents(
    studentCards,
    (newCards) => dispatch(updateStudentCards(newCards))
  );

  const handleClickBtn = (
    inputEventName: string,
    inputEventSurname: string,
    numberSelect: number,
    letterSelect: string
  ) => {
    if (!numberSelect) {
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
    setNumberSelect(0);
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

    dispatch(updateStudentCards(newStudentCards.newCards));
    dispatch(
      updateSelectedStudents(
        selectedStudents.filter((student) => {
          const wasMove = newStudentCards.movedStudents.some((moveStudent) => {
            return moveStudent.id === student.id;
          });
          return !wasMove;
        })
      )
    );
  };

  return (
    <div className="ClassList">
      <CardsContainer
        dispatch={dispatch}
        selectedStudents={selectedStudents}
        studentCards={studentCards}
        inputEventName={inputEventName}
        inputEventSurname={inputEventSurname}
        letterSelect={letterSelect}
        cardLetter={""}
        handleMoveStudents={handleMoveStudents}
        setInputEventName={setInputEventName}
        setInputEventSurname={setInputEventSurname}
        handleClickBtn={handleClickBtn}
        numberSelect={numberSelect}
        setNumberSelect={setNumberSelect}
        setLetterSelect={setLetterSelect}
        handleLogout={handleLogout}
        groupCards={groupCards}
        groupSortNumber={groupSortNumber}
      />
    </div>
  );
}

export default StudentsList;
