import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, UserButton, SignInButton } from "@clerk/clerk-react";
import {
  Menu,
  X,
  Heart,
  Hourglass,
  Home,
  MessageSquare,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { name: "Home", id: "home", icon: Home },
  { name: "Story", id: "story", icon: Heart },
  { name: "Timeline", id: "timeline", icon: Hourglass },
];

interface NavbarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      {/* ────── FLOATING DECORATIVE SPARKLES ────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [-4, 4, -4], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-2 left-[15%] text-rose-300/60"
        >
          <Sparkles className="w-3 h-3" />
        </motion.div>
        <motion.div
          animate={{ y: [3, -3, 3], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-6 right-[20%] text-pink-300/60"
        >
          <Star className="w-2.5 h-2.5" />
        </motion.div>
      </div>

      {/* ────── MAIN NAVBAR ────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="pointer-events-auto relative bg-gradient-to-br from-rose-50/95 via-pink-50/90 to-rose-50/95 backdrop-blur-xl border-2 border-rose-200/80 text-rose-950 shadow-xl shadow-rose-200/40 max-w-5xl w-full px-6 py-3 rounded-full flex items-center justify-between"
      >
        {/* Decorative gradient glow */}
        <div className="absolute -inset-px rounded-full bg-gradient-to-r from-rose-300/0 via-pink-300/30 to-purple-300/0 blur-sm pointer-events-none" />

        {/* ────── BRAND LOGO ────── */}
        <button
          onClick={() => onTabChange("home")}
          className="relative flex items-center gap-2.5 cursor-pointer focus:outline-none group z-10"
        >
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0], scale: 1.06 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center"
          >
            <img
              src="/logo.png"
              alt="RyTa AI Logo"
              className="w-full h-full object-contain drop-shadow-sm relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 rounded-full bg-rose-300/0 group-hover:bg-rose-300/30 blur-md transition-all duration-500" />
          </motion.div>

          <span className="font-[Fredoka] font-bold text-xl sm:text-2xl tracking-wide flex items-center gap-1.5 drop-shadow-sm">
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent">
              RyTa
            </span>
            <span className="text-purple-500">AI</span>
            <Heart
              className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500 text-rose-500 ryta-heart-pulse-sm"
              strokeWidth={0}
            />
          </span>
        </button>

        {/* ────── DESKTOP NAV ────── */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1.5 rounded-full border border-rose-200/80 shadow-inner relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative px-5 py-2 font-[Fredoka] text-base font-medium transition-colors duration-200 flex items-center gap-2 rounded-full cursor-pointer focus:outline-none group ${isActive ? "text-rose-700" : "text-rose-800/70 hover:text-rose-700"
                  }`}
              >
                {/* Active pill — smooth slide via layoutId */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 rounded-full border border-rose-300/80 shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                      mass: 0.7,
                    }}
                  />
                )}

                {/* Sparkle on active */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1 text-rose-400 z-20"
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                )}

                {/* Hover bg for non-active */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-full bg-rose-50/0 group-hover:bg-rose-50/80 transition-colors duration-150" />
                )}

                <Icon
                  className={`w-4 h-4 relative z-10 transition-transform duration-200 ${isActive
                      ? "scale-110 text-rose-500"
                      : "text-rose-400 group-hover:scale-105 group-hover:text-rose-500"
                    }`}
                />
                <span className="relative z-10">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* ────── DESKTOP ACTIONS ────── */}
        <div className="hidden md:flex items-center gap-3 relative z-10">
          {/* Launch Chat */}
          <motion.button
            onClick={() => navigate("/chat")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group relative px-4 py-2 rounded-full bg-rose-100/80 hover:bg-rose-200/80 text-rose-700 font-[Fredoka] font-bold text-xs sm:text-sm border border-rose-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <MessageSquare className="w-3.5 h-3.5 text-rose-500 relative z-10" />
            <span className="relative z-10">Launch Chat</span>
            <ArrowRight className="w-3 h-3 text-rose-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
          </motion.button>

          {/* User / Sign In */}
          {isLoaded && isSignedIn ? (
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="relative p-1 rounded-full border-2 border-rose-300 bg-white shadow-sm flex items-center justify-center"
            >
              <UserButton userProfileMode="modal" />
              <span className="absolute inset-0 rounded-full border-2 border-rose-300/50 animate-ping-slow pointer-events-none" />
            </motion.div>
          ) : (
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="group relative px-5 py-2 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 text-white font-[Fredoka] font-bold text-sm tracking-wide shadow-md shadow-rose-400/40 flex items-center gap-2 cursor-pointer border border-white/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Heart
                  className="w-3.5 h-3.5 fill-white text-white ryta-heart-pulse-sm relative z-10"
                  strokeWidth={0}
                />
                <span className="relative z-10">Sign in</span>
              </motion.button>
            </SignInButton>
          )}
        </div>

        {/* ────── MOBILE TOGGLE ────── */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden relative p-2 text-rose-600 focus:outline-none cursor-pointer rounded-full hover:bg-rose-100/50 transition-colors z-10"
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.header>

      {/* ────── MOBILE DRAWER ────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="pointer-events-auto absolute top-20 inset-x-4 bg-gradient-to-br from-rose-50/95 via-pink-50/95 to-rose-50/95 border-2 border-rose-200 backdrop-blur-2xl rounded-3xl p-5 flex flex-col gap-3 shadow-xl md:hidden"
          >
            <div className="absolute -top-2 -right-2 text-rose-300">
              <Sparkles className="w-5 h-5" />
            </div>

            {navItems.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl font-[Fredoka] font-bold text-base transition-colors w-full text-left cursor-pointer ${activeTab === item.id
                    ? "bg-gradient-to-r from-rose-200/80 to-pink-200/60 text-rose-700"
                    : "text-rose-800 hover:bg-rose-100"
                  }`}
              >
                <item.icon className="w-5 h-5 text-rose-500" />
                <span>{item.name}</span>
                {activeTab === item.id && (
                  <Sparkles className="w-4 h-4 text-rose-400 ml-auto" />
                )}
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/chat");
              }}
              className="group relative flex items-center gap-3 p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-[Fredoka] font-bold text-base transition-all w-full text-left cursor-pointer shadow-md overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <MessageSquare className="w-5 h-5 text-white relative z-10" />
              <span className="relative z-10">Launch Chat Page</span>
              <ArrowRight className="w-4 h-4 ml-auto relative z-10" />
            </motion.button>

            <div className="pt-3 border-t border-rose-200 flex justify-center items-center">
              {isSignedIn ? (
                <UserButton showName />
              ) : (
                <SignInButton mode="modal" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;