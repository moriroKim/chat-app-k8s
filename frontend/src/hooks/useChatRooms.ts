import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import type { ChatRoom } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UseChatRoomsReturn {
  chatRooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  setSelectedRoom: (room: ChatRoom | null) => void;
  isCreatingRoom: boolean;
  setIsCreatingRoom: (isCreating: boolean) => void;
  createRoom: (name: string) => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useChatRooms = (socketRef: React.RefObject<Socket>): UseChatRoomsReturn => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 채팅방 목록 가져오기
  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("채팅방 목록을 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      setChatRooms(data);
    } catch (error) {
      console.error("채팅방 목록 가져오기 실패:", error);
      setError("채팅방 목록을 가져오는데 실패했습니다.");
    }
  };

  // 새 채팅방 생성
  const createRoom = async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("채팅방 생성에 실패했습니다.");
      }

      const newRoom = await response.json();
      console.log("새 채팅방 생성됨:", newRoom);

      // 새 채팅방을 목록에 추가
      setChatRooms((prev) => [...prev, newRoom]);

      // 새 채팅방 선택
      setSelectedRoom(newRoom);

      // 소켓 이벤트 발생
      if (socketRef.current) {
        socketRef.current.emit("new_room", newRoom);
        socketRef.current.emit("join_room", newRoom.id);
      }

      setIsCreatingRoom(false);
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      setError("채팅방 생성에 실패했습니다.");
    }
  };

  // 채팅방 선택 시 소켓 이벤트 처리
  useEffect(() => {
    if (selectedRoom && socketRef.current) {
      // 이전 방에서 나가기
      if (selectedRoom.id) {
        socketRef.current.emit("leave_room", selectedRoom.id);
      }
      // 새 방 참여
      socketRef.current.emit("join_room", selectedRoom.id);
    }
  }, [selectedRoom, socketRef]);

  // 새 채팅방 이벤트 리스너
  useEffect(() => {
    if (!socketRef.current) return;

    const handleNewRoom = (newRoom: ChatRoom) => {
      console.log("새 채팅방 이벤트 수신:", newRoom);
      setChatRooms((prev) => {
        // 이미 존재하는 방인지 확인
        if (prev.some((room) => room.id === newRoom.id)) {
          return prev;
        }
        return [...prev, newRoom];
      });
    };

    socketRef.current.on("new_room", handleNewRoom);

    return () => {
      socketRef.current?.off("new_room", handleNewRoom);
    };
  }, [socketRef]);

  // 초기 채팅방 목록 로드
  useEffect(() => {
    fetchChatRooms();
  }, []);

  return {
    chatRooms,
    selectedRoom,
    setSelectedRoom,
    isCreatingRoom,
    setIsCreatingRoom,
    createRoom,
    error,
    setError,
  };
};
