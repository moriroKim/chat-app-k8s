import { useState, useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import type { Message } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UseMessagesReturn {
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  hasMore: boolean;
  loadMoreMessages: () => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  hasNewMessages: boolean;
  setHasNewMessages: (hasNew: boolean) => void;
}

export const useMessages = (
  roomId: string,
  socketRef: React.RefObject<Socket>
): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // 메시지 목록 가져오기
  const fetchMessages = async (pageNum: number) => {
    if (!roomId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/api/chat/rooms/${roomId}/messages?page=${pageNum}&limit=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("메시지를 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      if (pageNum === 1) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
      }
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("메시지 가져오기 실패:", error);
      setError("메시지를 가져오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 메시지 로드
  useEffect(() => {
    setPage(1);
    setMessages([]);
    fetchMessages(1);
  }, [roomId]);

  // 이전 메시지 로드
  const loadMoreMessages = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  }, [isLoading, hasMore, page]);

  // 메시지 전송
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !socketRef.current) return;

    try {
      const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        throw new Error("메시지 전송에 실패했습니다.");
      }

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      socketRef.current.emit("send_message", message);
      scrollToBottom();
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setError("메시지 전송에 실패했습니다.");
    }
  };

  // 스크롤 관련 함수들
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setHasNewMessages(false);
    }
  }, []);

  // 새 메시지 수신
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (message: Message) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);
        const container = messagesContainerRef.current;
        if (container) {
          const isAtBottom =
            container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
          if (!isAtBottom) {
            setHasNewMessages(true);
          } else {
            scrollToBottom();
          }
        }
      }
    };

    socketRef.current.on("receive_message", handleReceiveMessage);

    return () => {
      socketRef.current?.off("receive_message", handleReceiveMessage);
    };
  }, [roomId, socketRef, scrollToBottom]);

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    isLoading,
    error,
    setError,
    hasMore,
    loadMoreMessages,
    messagesContainerRef,
    scrollToBottom,
    hasNewMessages,
    setHasNewMessages,
  };
};
