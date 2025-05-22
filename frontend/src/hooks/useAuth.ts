import { useState, useEffect } from "react";
import type { User } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // 토큰이 있으면 사용자 정보 가져오기
      fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("사용자 정보를 가져오는데 실패했습니다.");
          }
          return res.json();
        })
        .then((data) => {
          setUser(data);
          setIsAuthenticated(true);
          setError(null);
        })
        .catch((error) => {
          console.error("사용자 정보 조회 실패:", error);
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
          setError("사용자 정보를 가져오는데 실패했습니다.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("로그인에 실패했습니다.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      setError("로그인에 실패했습니다.");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
};
