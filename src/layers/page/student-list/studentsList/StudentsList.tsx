import React, { useEffect } from "react";
import { useState } from "react";
import "../../../../App.scss";
import CardsContainer from "./CardsContainer";
import { handleStudents } from "../useHandleStudent";
import { useNavigate } from "react-router-dom";
import {
  StudentCard,
  SelectedStudent,
  Student,
} from "../../../../types/studentType";
import { Group } from "../../../../types/studentType";
import { useAppSelector } from "../../../../store/hooks";
import {
  addStudent,
  updateSelectedStudents,
  updateStudentCards,
} from "../../../../store/slices/studentsSlice";
import { useDispatch } from "react-redux";
import { useStudentsSync } from "../useStudentsSync";
import { useCreateUserMutation } from "../../../../store/api/usersApi";

function StudentsList() {
  const dispatch = useDispatch();
  const studentCards = useAppSelector((state) => state.students.studentCards);
  const selectedStudents = useAppSelector(
    (state) => state.students.selectedStudents
  );

  const navigate = useNavigate();

  const { isLoading: syncLoading, error: syncError } = useStudentsSync();

  const [createUser, { isLoading: createLoading, error: createError }] =
    useCreateUserMutation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

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

  // 🔄 ИСПРАВЛЯЕМ: создаем совместимую функцию для handleStudents
  const setStudentCardsState = (
    newCards: StudentCard[] | ((prev: StudentCard[]) => StudentCard[])
  ) => {
    if (typeof newCards === "function") {
      // Если передана функция (как в setState)
      const updatedCards = newCards(studentCards);
      dispatch(updateStudentCards(updatedCards));
    } else {
      // Если передан массив
      dispatch(updateStudentCards(newCards));
    }
  };

  // 🔄 ИСПРАВЛЯЕМ: передаем совместимую функцию
  const { handleMoveStudentsById } = handleStudents(
    studentCards,
    setStudentCardsState // 🔄 Теперь совместимо с SetStateAction
  );

  // 🔄 ИСПРАВЛЕННЫЙ handleClickBtn
  const handleClickBtn = (
    name: string,
    surname: string,
    number: number,
    letter: string
  ) => {
    if (name.trim() && surname.trim() && number && letter) {
      const studentClass = `${number}${letter}`;

      // Генерируем данные для студента
      const studentId = Date.now().toString();
      const login = `${name.toLowerCase()}${surname.toLowerCase()}${number}${letter}`;
      const password = "12345";

      const studentData = {
        id: studentId,
        name: name.trim(),
        surname: surname.trim(),
        login,
        password,
        class: studentClass,
        role: "student" as const,
      };

      // 1. Сначала добавляем в Redux
      dispatch(
        addStudent({
          name,
          surname,
          class: studentClass,
        })
      );

      // 2. Затем создаем в БД
      createUser(studentData)
        .unwrap()
        .then(() => {
          console.log("✅ Студент добавлен в БД:", studentData);
        })
        .catch((error) => {
          console.error("❌ Ошибка при добавлении в БД:", error);
        });

      // Очищаем поля
      setInputEventName("");
      setInputEventSurname("");
      setNumberSelect(0);
      setLetterSelect("");
    }
  };

  // 🔄 ИСПРАВЛЕННЫЙ handleMoveStudents
  const handleMoveStudents = (index: number) => {
    const newStudentCards = handleMoveStudentsById(
      selectedStudents,
      index,
      studentCards,
      numberSelect,
      letterSelect
    );

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

  // Показываем состояние загрузки
  if (syncLoading) {
    return (
      <div className="ClassList">
        <div className="loading">🔄 Загрузка студентов из базы данных...</div>
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="ClassList">
        <div className="error">
          ❌ Ошибка загрузки студентов: {String(syncError)}
        </div>
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  return (
    <div className="ClassList">
      {createLoading && (
        <div className="loading-overlay">
          <div className="loading-message">Создание студента...</div>
        </div>
      )}

      {createError && (
        <div className="error-message">
          ❌ Ошибка при создании студента: {String(createError)}
        </div>
      )}

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
