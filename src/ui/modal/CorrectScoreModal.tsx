import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import Button from "../button/Button";
import Modal from "./Modal";
import { Score } from "../../services/api";
import Input from "../input/Input";
const CorrectScoreModal = ({ updateScore, grade }) => {
  const { isOpen, onOpen, onClose } = useModal();

  const [formData, setFormData] = useState({
    score: grade?.score || 0,
    type: grade?.type || "",
    comment: grade?.comment || "",
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateScore(formData);
    onClose();
  };
  return (
    <div>
      <Button size="addAndOut" className="btn-modal" onClick={onOpen}>
        Редактировать
      </Button>

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
                required
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
                required
              />
            </div>
            <Button size="normal" type="submit">
              Ok
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default CorrectScoreModal;
