import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
});

// 미들웨어
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

// 응답 헤더 설정
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Socket.IO 인증 미들웨어
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("인증이 필요합니다."));
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      id: number;
      username: string;
    };
    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error("유효하지 않은 토큰입니다."));
  }
});

// 라우트
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// 소켓 연결
io.on("connection", (socket) => {
  console.log("클라이언트 연결됨:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`사용자 ${socket.id}가 ${roomId}방에 입장했습니다.`);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`사용자 ${socket.id}가 ${roomId}방에서 퇴장했습니다.`);
  });

  socket.on("send_message", (message) => {
    // 같은 방의 모든 클라이언트에게 메시지 브로드캐스팅
    io.to(message.roomId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("클라이언트 연결 해제:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
