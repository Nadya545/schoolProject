import React from "react";
import StudentCard from "./StudentCard";
import Modal from "./Modal";
const CardsContainer = ({
  studentCards,
  inputEventName,
  setInputEventName,
  inputEventSurname,
  setInputEventSurname,
  selectedStudents,
  setSelectedStudents,
  handleMoveStudents,
  handleClickBtn,
  numberSelect,
  setNumberSelect,
  letterSelect,
  setLetterSelect,
  handleLogout,
  groupCards,
  groupSortNumber,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
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
        <Modal
          handleSubmit={handleSubmit}
          inputEventName={inputEventName}
          setInputEventName={setInputEventName}
          inputEventSurname={inputEventSurname}
          setInputEventSurname={setInputEventSurname}
          numberSelect={numberSelect}
          setNumberSelect={setNumberSelect}
          letterSelect={letterSelect}
          setLetterSelect={setLetterSelect}
        />
        <button className="btn-class-list" onClick={handleLogout}>
          Выход
        </button>
      </div>

      {sortNum.map((number) => (
        <div key={number} className="groupNumber">
          {groups[number]
            .sort((a, b) => a.letter.localeCompare(b.letter))
            .map((cardData, index) => (
              <StudentCard
                handleMoveStudents={handleMoveStudents}
                cardData={cardData}
                key={cardData.id}
                selectedStudents={selectedStudents}
                setSelectedStudents={setSelectedStudents}
                index={index}
              />
            ))}
        </div>
      ))}
    </div>
  );
};

export default CardsContainer;
