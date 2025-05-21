import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
}

const router = express.Router();

// 회원가입
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    // 이메일 중복 체크
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error("회원가입 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "이메일과 비밀번호를 입력해주세요." });
    }

    // 사용자 조회
    const [rows] = await pool.query<User[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    console.log("조회된 사용자:", rows);

    const user = rows[0];
    console.log("파싱된 사용자:", user);

    if (!user) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({ token, user: user.username });
  } catch (error) {
    console.error("로그인 에러:", error);
    res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

export default router;
