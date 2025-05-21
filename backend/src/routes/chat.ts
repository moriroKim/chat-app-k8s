import express, { Request } from "express";
import pool from "../config/database";
import { authenticateToken } from "../middleware/auth";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

const router = express.Router();

// 채팅방 목록 조회
router.get("/rooms", authenticateToken, async (req, res) => {
  try {
    const [rooms] = await pool.query("SELECT * FROM chat_rooms");
    res.json(rooms);
  } catch (error) {
    console.error("채팅방 목록 조회 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

// 채팅방 생성
router.post("/rooms", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query(
      "INSERT INTO chat_rooms (name) VALUES (?)",
      [name]
    );
    const [newRoom] = await pool.query(
      "SELECT * FROM chat_rooms WHERE id = LAST_INSERT_ID()"
    );
    const rooms = newRoom as any[];
    res.status(201).json(rooms[0]);
  } catch (error) {
    console.error("채팅방 생성 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

// 채팅 메시지 조회
router.get("/rooms/:roomId/messages", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // 메시지 조회
    const [messages] = await pool.query(
      `SELECT m.*, u.username as sender 
       FROM messages m 
       JOIN users u ON m.user_id = u.id 
       WHERE m.room_id = ? 
       ORDER BY m.created_at DESC 
       LIMIT ? OFFSET ?`,
      [roomId, limit, offset]
    );

    // 전체 메시지 수 조회
    const [totalCount] = await pool.query(
      "SELECT COUNT(*) as total FROM messages WHERE room_id = ?",
      [roomId]
    );

    const total = (totalCount as any[])[0].total;
    const messageArray = messages as any[];

    // 메시지를 시간순으로 정렬 (오래된 순)
    messageArray.reverse();

    res.json({
      messages: messageArray,
      total,
      hasMore: offset + messageArray.length < total,
    });
  } catch (error) {
    console.error("메시지 조회 에러:", error);
    res.status(500).json({ message: "메시지를 불러오는데 실패했습니다." });
  }
});

// 메시지 전송
router.post(
  "/rooms/:roomId/messages",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { roomId } = req.params;
      const { content } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
      }

      const userId = req.user.id;

      // 메시지 저장
      const [result] = await pool.query(
        "INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)",
        [roomId, userId, content]
      );

      // 새로 저장된 메시지 조회
      const [newMessage] = await pool.query(
        `SELECT m.*, u.username as sender 
         FROM messages m 
         JOIN users u ON m.user_id = u.id 
         WHERE m.id = LAST_INSERT_ID()`
      );
      const messages = newMessage as any[];
      res.status(201).json(messages[0]);
    } catch (error) {
      console.error("메시지 전송 에러:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }
);

export default router;
