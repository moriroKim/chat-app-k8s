import { useRef, useCallback, useState } from "react";

interface UseScrollToBottomReturn {
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  hasNewMessages: boolean;
  setHasNewMessages: (value: boolean) => void;
}

/**
 * 스크롤을 최하단으로 이동하는 커스텀 훅
 * @returns messagesContainerRef, scrollToBottom, hasNewMessages, setHasNewMessages
 */
const useScrollToBottom = (): UseScrollToBottomReturn => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    setHasNewMessages(false);
  }, []);

  return {
    messagesContainerRef,
    scrollToBottom,
    hasNewMessages,
    setHasNewMessages,
  };
};

export default useScrollToBottom;
