import { io } from "socket.io-client";
import { WS_URL } from "../config";

export const socket = io(WS_URL, {
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  path: "/socket.io/",
  withCredentials: true,
  forceNew: true,
});

export const connectSocket = (token: string) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};
