import React from "react";
import StudentCard from "./StudentCard";
import { CardData, CardsContainerProps } from "../../../../types/studentType";
import Button from "../../../../ui/button/Button";
import AddStudentModal from "../../../../ui/modal/AddStudentModal";

const CardsContainer: React.FC<CardsContainerProps> = ({
  studentCards,
  inputEventName,
  inputEventSurname,
  selectedStudents,
  numberSelect,
  letterSelect,
  dispatch,
  setInputEventName,
  setInputEventSurname,
  handleMoveStudents,
  handleClickBtn,
  setNumberSelect,
  setLetterSelect,
  handleLogout,
  groupCards,
  groupSortNumber,
}) => {
  // 🔄 УБИРАЕМ дублирование createUser - он уже в StudentsList

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🔄 ИСПРАВЛЯЕМ: передаем только данные, без callback
    handleClickBtn(
      inputEventName,
      inputEventSurname,
      numberSelect,
      letterSelect
    );
  };

  const groups = groupCards(studentCards);
  const sortNum = groupSortNumber(groups);

  return (
    <div className="CardsContainer">
      <div className="buttons">
        <AddStudentModal
          inputEventName={inputEventName}
          inputEventSurname={inputEventSurname}
          numberSelect={numberSelect}
          letterSelect={letterSelect}
          handleSubmit={handleSubmit}
          setInputEventName={setInputEventName}
          setInputEventSurname={setInputEventSurname}
          setNumberSelect={setNumberSelect}
          setLetterSelect={setLetterSelect}
        />
        <Button
          size="addAndOut"
          className="btn-class-list"
          onClick={handleLogout}
        >
          Выход
        </Button>
      </div>

      {sortNum.map((number) => (
        <div key={number} className="groupNumber">
          {groups[number]
            .sort((a, b) => a.letter.localeCompare(b.letter))
            .map((cardData: CardData, index) => (
              <StudentCard
                dispatch={dispatch}
                cardData={cardData}
                key={cardData.id}
                selectedStudents={selectedStudents}
                index={index}
                handleMoveStudents={handleMoveStudents}
              />
            ))}
        </div>
      ))}
    </div>
  );
};

export default CardsContainer;
