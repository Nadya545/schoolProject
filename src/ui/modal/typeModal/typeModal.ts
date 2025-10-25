export interface AddStudentModalProps {
  inputEventName: string;
  inputEventSurname: string;
  numberSelect: number;
  letterSelect: string;
  handleSubmit: (e: React.FormEvent) => void;
  setInputEventName: (value: string) => void;
  setInputEventSurname: (value: string) => void;
  setNumberSelect: (value: number) => void;
  setLetterSelect: (value: string) => void;
}
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  container?: Element | null;
}
