import { useState, useCallback } from "react";

interface UseModalReturn<T = any> {
  isOpen: boolean; // открыто ли модальное окно
  content: T | null; // содержимое модалки (может быть любого типа)
  onOpen: (content?: T) => void; // функция открытия
  onClose: () => void; // функция закрытия
  onToggle: (content?: T) => void; // функция переключения состояния
}

export function useModal<T = any>(initialState = false): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(initialState);
  const [content, setContent] = useState<T | null>(null);

  const onOpen = useCallback((newContent?: T) => {
    setContent(newContent ?? null);
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setContent(null);
  }, []);

  const onToggle = useCallback((newContent?: T) => {
    setIsOpen((prev) => !prev);
    if (newContent !== undefined) setContent(newContent);
  }, []);

  return {
    isOpen,
    content,
    onOpen,
    onClose,
    onToggle,
  };
}
