import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  getChatRooms,
  getMessages,
  createChatRoom,
  sendMessage,
} from "../utils/api";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  roomId?: string;
}

interface ChatRoom {
  id: string;
  name: string;
}

const ChatRoom: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [error, setError] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 100);
    setHasNewMessages(false);
  };

  // 컴포넌트 마운트 시 사용자 정보 설정
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");

    if (!token || !userInfo) {
      navigate("/login");
      return;
    }

    try {
      setCurrentUser(JSON.parse(userInfo));
    } catch (error) {
      console.error("사용자 정보 파싱 에러:", error);
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Socket.IO 연결 설정
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const socket = io("http://localhost:3000", {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError("");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setError("서버와의 연결이 끊어졌습니다.");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setError("서버와의 연결에 문제가 발생했습니다.");
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  // Socket.IO 메시지 수신 처리
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (message: Message) => {
      if (message.roomId === selectedRoom) {
        setMessages((prev) => {
          const isDuplicate = prev.some((m) => m.id === message.id);
          if (isDuplicate) return prev;
          const newMessages = [...prev, message];

          // 현재 스크롤이 최하단에 있는지 확인
          if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
              messagesContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

            if (isAtBottom) {
              // 스크롤이 최하단에 있으면 자동으로 스크롤
              requestAnimationFrame(() => {
                scrollToBottom();
              });
            } else {
              // 스크롤이 최하단이 아니면 새 메시지 알림 표시
              setHasNewMessages(true);
            }
          }

          return newMessages;
        });
      }
    };

    socketRef.current.on("receive_message", handleReceiveMessage);

    return () => {
      socketRef.current?.off("receive_message", handleReceiveMessage);
    };
  }, [selectedRoom]);

  // 메시지 가져오기 함수
  const fetchMessages = async (roomId: string, pageNum: number = 1) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await getMessages(roomId, token, pageNum);

      if (pageNum === 1) {
        // 첫 페이지 로드 시 (최신 메시지)
        setMessages(response.messages);
        setHasMore(response.hasMore);
        setPage(1);
        // 스크롤을 맨 아래로 이동
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      } else {
        // 이전 메시지 로드 시
        setMessages((prev) => [...response.messages, ...prev]);
        setHasMore(response.hasMore);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      setError("메시지를 불러오는데 실패했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 채팅방 선택 시 Socket.IO 구독 및 메시지 로드
  useEffect(() => {
    if (!selectedRoom || !socketRef.current?.connected) return;

    socketRef.current.emit("join_room", selectedRoom);
    fetchMessages(selectedRoom);

    return () => {
      socketRef.current?.emit("leave_room", selectedRoom);
    };
  }, [selectedRoom]);

  // 스크롤 위치 감지
  const handleScroll = async () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop } = messagesContainerRef.current;

    // 이전 메시지 로드 (스크롤이 맨 위에서 50px 이내로 올라왔을 때)
    if (scrollTop < 50 && !isLoading && hasMore) {
      fetchMessages(selectedRoom, page + 1);
    }
  };

  // 초기 채팅방 목록 로드
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchRooms = async () => {
      try {
        const data = await getChatRooms(token);
        setRooms(data);
        if (data.length > 0) {
          const firstRoomId = data[0].id;
          setSelectedRoom(firstRoomId);
        }
      } catch (error) {
        setError("채팅방 목록을 불러오는데 실패했습니다.");
        console.error(error);
      }
    };

    fetchRooms();
  }, [navigate]);

  // 채팅방 선택 핸들러
  const handleRoomSelect = (roomId: string) => {
    if (roomId === selectedRoom) {
      // 같은 채팅방을 다시 선택한 경우 최신 메시지 재요청
      fetchMessages(roomId);
    } else {
      // 다른 채팅방을 선택한 경우
      setSelectedRoom(roomId);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !currentUser) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const message = await sendMessage(selectedRoom, newMessage, token);
      const messageWithRoomId = {
        ...message,
        roomId: selectedRoom,
        sender: currentUser.username,
        timestamp: new Date().toISOString(),
      };

      socketRef.current?.emit("send_message", messageWithRoomId);
      setNewMessage("");
      // 메시지 전송 시에만 스크롤을 맨 아래로 이동
      scrollToBottom();
    } catch (error) {
      setError("메시지 전송에 실패했습니다.");
      console.error(error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const newRoom = await createChatRoom(newRoomName, token);
      setRooms([...rooms, newRoom]);
      setNewRoomName("");
      setIsCreatingRoom(false);
    } catch (error) {
      setError("채팅방 생성에 실패했습니다.");
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]">
      {/* 채팅방 목록 */}
      <div className="w-80 bg-white/5 backdrop-blur-lg border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">채팅방</h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <button
                onClick={() => setIsCreatingRoom(!isCreatingRoom)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 4v16m-8-8h16"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-400 transition-all shadow-lg"
                title="로그아웃"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          {isCreatingRoom && (
            <form onSubmit={handleCreateRoom} className="mb-4">
              <div className="flex items-center bg-white/10 rounded-lg px-2 focus-within:ring-2 focus-within:ring-cyan-400">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-400 py-2 px-2"
                  placeholder="새로운 채팅방 이름"
                />
                <button
                  type="submit"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg ml-2"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </form>
          )}
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20 mb-4">
              {error}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`p-4 cursor-pointer text-gray-300 hover:bg-white/5 transition-colors duration-200 ${
                selectedRoom === room.id ? "bg-white/10" : ""
              }`}
              onClick={() => handleRoomSelect(room.id)}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mr-3"></div>
                <span className="truncate">{room.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 flex flex-col w-[480px] mx-auto ">
        {selectedRoom ? (
          <>
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 relative"
            >
              {isLoading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-400"></div>
                    <span className="text-sm text-gray-200">
                      이전 메시지 불러오는 중...
                    </span>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === currentUser?.username
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-[50%]">
                    <div
                      className={`p-3 rounded-lg break-words whitespace-pre-wrap ${
                        message.sender === currentUser?.username
                          ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white"
                          : "bg-white/10 text-gray-200"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {message.sender} •{" "}
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {hasNewMessages && (
              <button
                onClick={scrollToBottom}
                className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:from-blue-500 hover:to-cyan-400 transition-all flex items-center gap-2 z-50"
              >
                <span>새 메시지</span>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 5v14M5 12l7-7 7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-white/10"
            >
              <div className="flex items-center bg-white/10 rounded-lg px-2 focus-within:ring-2 focus-within:ring-cyan-400 max-w-[1000px] mx-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-400 py-3 px-2"
                  placeholder="메시지를 입력하세요..."
                />
                <button
                  type="submit"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg ml-2"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            채팅방을 선택해주세요
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
