import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "로딩 중..." }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-300 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
