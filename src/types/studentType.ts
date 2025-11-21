import { AppDispatch } from "../store";

export interface Student {
  id: string;
  name: string;
  surname: string;
}

export interface SelectedStudent {
  id: string;
  number: number;
  letter: string;
}

export interface StudentCard {
  id: string;
  letter: string;
  number: number;
  students: Student[];
}

export interface MoveStudentsResult {
  newCards: StudentCard[];
  movedStudents: Student[];
  notMovedStudents: Student[];
}

export interface Group {
  [key: number]: StudentCard[];
}

export interface CardsContainerProps {
  cardLetter: string;
  studentCards: StudentCard[];
  inputEventName: string;
  inputEventSurname: string;
  selectedStudents: SelectedStudent[];
  numberSelect: number;
  letterSelect: string;
  dispatch: AppDispatch;
  setInputEventName: (value: string) => void;
  setInputEventSurname: (value: string) => void;
  setSelectedStudents?: (students: SelectedStudent[]) => void;
  handleMoveStudents: (index: number) => void;
  handleClickBtn: (
    name: string,
    surname: string,
    number: number,
    letter: string
  ) => void;
  setNumberSelect: (value: number) => void;
  setLetterSelect: (value: string) => void;
  handleLogout: () => void;
  groupCards: (arr: StudentCard[]) => Group;
  groupSortNumber: (arr: Group) => number[];
}
export interface CardData {
  id: string;
  letter: string;
  number: number;
  students: Student[];
}
export interface StudentCardProps {
  index: number;
  cardData: CardData;
  handleMoveStudents: (index: number) => void;
  dispatch: AppDispatch;
  selectedStudents: SelectedStudent[];
}

export interface StudentProps {
  numberClass: number;
  cardLetter: string;
  student: Student;
  selectedStudents: SelectedStudent[];
  dispatch: AppDispatch;
}
