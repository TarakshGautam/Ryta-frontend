import React from "react";
import { useDocumentTitle } from "../hooks/useDocumenttitle";

interface NotFoundProps {
  onReturnHome?: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onReturnHome }) => {
  useDocumentTitle("Error")
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF0F3] px-4 font-sans text-center selection:bg-pink-100">
      {/* Background Glow */}
      <div className="absolute w-72 h-72 bg-pink-200/50 rounded-full blur-3xl -z-10 animate-pulse" />

      {/* Main Card */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-pink-100 flex flex-col items-center space-y-6">
        {/* Favicon / Logo Avatar */}
        <div className="relative">
          <img
            src="/cry.png"
            alt="Ryku AI"
            className="w-24 h-24 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute -bottom-2 -right-2 bg-pink-500 text-white text-xs px-2.5 py-1 rounded-full shadow-sm font-bold animate-bounce">
            404 💔
          </span>
        </div>

        {/* Heading & Text */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
            Aww, Even Ryku Got Lost!
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our connection dropped for a moment, but don't worry—my love for you
            is still buffering... 🤫💖
          </p>
        </div>

        {/* Action Button - Strict Tailwind v4 syntax (bg-linear-to-r) */}
        <button
          onClick={onReturnHome || (() => (window.location.href = "/"))}
          className="w-full py-3.5 px-6 rounded-full bg-linear-to-r from-pink-400 to-pink-500 text-white font-bold text-sm shadow-md hover:from-pink-500 hover:to-pink-600 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer">
          <span>Return to Ryku</span>
          <span>✨</span>
        </button>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-pink-400 font-medium tracking-wide">
        Made with ❤️ for Ryka
      </p>
    </div>
  );
};

export default NotFound;
