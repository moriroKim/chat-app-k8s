import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "인증이 필요합니다." });
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { id: number; username: string };
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};
