export interface Student {
  id: number;
  name: string;
  surname: string;
}

export interface SelectedStudent {
  id: number;
  number: number;
  letter: string;
}

export interface StudentCard {
  id: number;
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
  setInputEventName: (value: string) => void;
  inputEventSurname: string;
  setInputEventSurname: (value: string) => void;
  selectedStudents: SelectedStudent[];
  setSelectedStudents: (students: SelectedStudent[]) => void;
  handleMoveStudents: (index: number) => void;
  handleClickBtn: (
    name: string,
    surname: string,
    number: string,
    letter: string
  ) => void;
  numberSelect: string;
  setNumberSelect: (value: string) => void;
  letterSelect: string;
  setLetterSelect: (value: string) => void;
  handleLogout: () => void;
  groupCards: (arr: StudentCard[]) => Group;
  groupSortNumber: (arr: Group) => number[];
}
