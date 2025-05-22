import React from "react";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  roomId?: string;
}

interface MessageListProps {
  messages: Message[];
  currentUser: { username: string } | null;
  isLoading: boolean;
  onScroll: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  hasNewMessages: boolean;
  onScrollToBottom: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  isLoading,
  onScroll,
  containerRef,
  hasNewMessages,
  onScrollToBottom,
}) => {
  return (
    <div className="flex-1 overflow-hidden relative">
      <div ref={containerRef} className="h-full overflow-y-auto p-4 space-y-4" onScroll={onScroll}>
        {isLoading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-400"></div>
              <span className="text-sm text-gray-200">이전 메시지 불러오는 중...</span>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === currentUser?.username ? "justify-end" : "justify-start"
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
                {message.timestamp
                  ? new Date(message.timestamp).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "시간 정보 없음"}
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasNewMessages && (
        <button
          onClick={onScrollToBottom}
          className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-full shadow-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
        >
          <span>새 메시지</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;
