// window.ENV 객체의 타입 정의
declare global {
  interface Window {
    ENV?: {
      VITE_API_URL?: string;
      VITE_WS_URL?: string;
    };
  }
}

// API_URL 설정
export const API_URL =
  window.ENV?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

// WebSocket URL 설정
export const WS_URL =
  window.ENV?.VITE_WS_URL ||
  import.meta.env.VITE_WS_URL ||
  "http://localhost:3000";
