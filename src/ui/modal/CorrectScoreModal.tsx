import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import Button from "../button/Button";
import Modal from "./Modal";
import { Score } from "../../store/api/scoresApi";
import Input from "../input/Input";

interface CorrectScoreModalProps {
  updateScoreHandler: (updateData: Partial<Score>) => void;
  grade: Score;
  size?: "small" | "normal";
  isOpen: boolean;
  onClose: () => void;
}

const CorrectScoreModal: React.FC<CorrectScoreModalProps> = ({
  updateScoreHandler,
  grade,
  size = "normal",
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    score: grade?.score || 0,
    type: grade?.type || "",
    comment: grade?.comment || "",
  });
  // 🔥 СБРАСЫВАЕМ ФОРМУ ПРИ ОТКРЫТИИ МОДАЛКИ
  useEffect(() => {
    if (isOpen) {
      setFormData({
        score: grade?.score || 0,
        type: grade?.type || "",
        comment: grade?.comment || "",
      });
    }
  }, [isOpen, grade]);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: Partial<Score> = {
      id: grade.id,
      studentId: grade.studentId,
      subject: grade.subject,
      class: grade.class,
      date: grade.date,
      teacherId: grade.teacherId,
      score: formData.score,
      type: formData.type,
      comment: formData.comment,
    };

    updateScoreHandler(updateData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-body">
        <form className="inputForm" onSubmit={handleFormSubmit}>
          <select
            value={formData.score}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                score: Number(e.target.value),
              }))
            }
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <div className="type">
            <Input
              type="text"
              name="type"
              value={formData.type}
              placeholder=""
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
            />
          </div>
          <div className="type">
            <Input
              type="text"
              name="comment"
              value={formData.comment}
              placeholder=""
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
            />
          </div>
          <Button size="normal" type="submit">
            Сохранить
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default CorrectScoreModal;
