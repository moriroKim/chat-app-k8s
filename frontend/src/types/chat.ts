export type ChatRoom = {
  id: string;
  name: string;
  createdAt: string;
};

export type Message = {
  id: string;
  content: string;
  sender: {
    id: number;
    username: string;
  };
  timestamp: string;
  roomId: string;
};

export type User = {
  id: number;
  username: string;
};
