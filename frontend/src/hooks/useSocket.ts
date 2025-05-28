import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketReturn {
  socketRef: React.RefObject<Socket | null>;
  isConnected: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const API_URL = "http://192.168.56.240:3000";

export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // 소켓 연결
    socketRef.current = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // 연결 이벤트 핸들러
    socketRef.current.on("connect", () => {
      console.log("소켓 연결됨");
      setIsConnected(true);
      setError(null);
    });

    socketRef.current.on("disconnect", () => {
      console.log("소켓 연결 해제");
      setIsConnected(false);
    });

    socketRef.current.on("error", (err) => {
      console.error("소켓 에러:", err);
      setError("소켓 연결에 실패했습니다.");
    });

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socketRef,
    isConnected,
    error,
    setError,
  };
};
