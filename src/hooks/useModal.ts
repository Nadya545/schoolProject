import { useState, useCallback } from "react";

interface UseModalReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

// 🔥 ПРОСТАЯ ВЕРСИЯ БЕЗ content
export function useModal(): UseModalReturn {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    onOpen,
    onClose,
  };
}
