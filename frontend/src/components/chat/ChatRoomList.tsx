import React, { useState } from "react";
import type { ChatRoom } from "../../types/chat";

interface ChatRoomListProps {
  chatRooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  setSelectedRoom: (room: ChatRoom | null) => void;
  isCreatingRoom: boolean;
  setIsCreatingRoom: (isCreating: boolean) => void;
  createRoom: (name: string) => Promise<void>;
  isConnected: boolean;
  error: string | null;
  onLogout: () => void;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  chatRooms,
  selectedRoom,
  setSelectedRoom,
  isCreatingRoom,
  setIsCreatingRoom,
  createRoom,
  isConnected,
  error,
  onLogout,
}) => {
  const [newRoomName, setNewRoomName] = useState("");

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    await createRoom(newRoomName);
    setNewRoomName("");
  };

  return (
    <div className="w-64 bg-gray-800 p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">채팅방</h2>
        <button
          onClick={() => setIsCreatingRoom(!isCreatingRoom)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          {isCreatingRoom ? "취소" : "새 방"}
        </button>
      </div>

      {isCreatingRoom && (
        <form onSubmit={handleCreateRoom} className="mb-4">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="채팅방 이름"
            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            생성
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto">
        {chatRooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`w-full text-left p-2 mb-2 rounded ${
              selectedRoom?.id === room.id
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!isConnected && <div className="text-yellow-500 mb-4">서버와 연결 중...</div>}

      <button
        onClick={onLogout}
        className="mt-auto bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        로그아웃
      </button>
    </div>
  );
};

export default ChatRoomList;
