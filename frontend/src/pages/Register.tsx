import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/api";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ username, email, password });
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] relative overflow-hidden">
      {/* 은은한 광선 애니메이션 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="login-glow"></div>
      </div>
      <div className="relative z-10 w-full max-w-sm p-8 rounded-2xl glass-card shadow-2xl border border-white/10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg mb-4">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path d="M12 4v16m-8-8h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">회원가입</h2>
          <p className="text-gray-300 text-sm">새로운 계정을 만들어보세요.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20 mb-2">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-gray-400 text-xs mb-1">
              사용자 이름
            </label>
            <div className="flex items-center bg-white/10 rounded-lg px-2 focus-within:ring-2 focus-within:ring-cyan-400">
              <input
                id="username"
                type="text"
                required
                className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-400 py-3 px-2"
                placeholder="사용자 이름을 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-400 text-xs mb-1">
              이메일
            </label>
            <div className="flex items-center bg-white/10 rounded-lg px-2 focus-within:ring-2 focus-within:ring-cyan-400">
              <input
                id="email"
                type="email"
                required
                className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-400 py-3 px-2"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-gray-400 text-xs mb-1">
              비밀번호
            </label>
            <div className="flex items-center bg-white/10 rounded-lg px-2 focus-within:ring-2 focus-within:ring-cyan-400">
              <input
                id="password"
                type="password"
                required
                className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-400 py-3 px-2"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>
        </form>
        <div className="mt-8 text-center text-gray-400 text-sm">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
