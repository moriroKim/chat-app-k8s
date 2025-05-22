import React from "react";

interface MessageInputProps {
  newMessage: string;
  onNewMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onNewMessageChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-white/10">
      <div className="flex items-center bg-white/10 rounded-lg px-2 focus-within:ring-2 focus-within:ring-cyan-400 max-w-[1000px] mx-auto">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onNewMessageChange(e.target.value)}
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
  );
};

export default MessageInput;
