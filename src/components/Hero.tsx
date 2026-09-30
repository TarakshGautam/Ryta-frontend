import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircleHeart,
  Sparkles,
  Bot,
  ShieldCheck,
  Heart,
  ArrowRight,
  UserCheck,
  Stars,
  User,
  MessageSquare,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useDocumentTitle } from "../hooks/useDocumenttitle";

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const [showChoiceModal, setShowChoiceModal] = useState(false);

  useDocumentTitle("Home"); // Output: Home | RyTa AI 💖

  // Handling "Let's Start Chat" logic with Auth Check
  const handleChatClick = () => {
    if (!isSignedIn) {
      openSignIn({
        afterSignInUrl: "/chat",
        afterSignUpUrl: "/chat"
      });
    } else {
      navigate("/chat");
    }
  };

  return (
    <section
      id="home"
      className="relative w-full min-h-full flex items-center justify-center px-4 sm:px-6 py-4 font-[Fredoka] select-none"    >
      {/* Background Glow Fix: w-[700px] & h-[400px] */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w[700px] h[400px] bg-linear-to-r from-rose-200/50 via-pink-300/30 to-purple-200/40 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-6xl w-full bg-white/80 backdrop-blur-2xl border-2 border-rose-200/90 rounded-[3rem] p-6 sm:p-10 shadow-[0_20px_70px_rgba(244,63,94,0.18)] relative z-10 my-auto overflow-hidden"
      >
        <Heart className="absolute -bottom-10 -left-10 w-48 h-48 text-rose-100/60 fill-rose-50/50 -rotate-12 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

          <div className="lg:col-span-7 flex flex-col items-start space-y-4">

            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 via-pink-500/15 to-rose-500/10 border border-rose-300 text-rose-700 shadow-sm shrink-0 select-none"
            >
              {/* Smooth & Slow Bouncing Robot Icon */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="shrink-0 flex items-center justify-center"
              >
                <Bot className="w-4 h-4 text-rose-600" />
              </motion.div>

              <span className="font-['Caveat'] text-xl font-bold flex items-center gap-1.5 leading-none shrink-0">
                RyTa AI <span className="text-rose-400">•</span>{" "}
                <span className="text-rose-600 font-extrabold tracking-wide">#RyTa Forever</span>
              </span>
              <Stars className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Talk to <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 drop-shadow-sm">RyTa AI</span>,
              <br />
              An AI Built with Pure Love 💖
            </h1>

            <p className="font-[Caveat] text-xl sm:text-2xl text-rose-950/90 leading-snug font-medium">
              "Crafted by <span className="underline decoration-wavy decoration-rose-400 font-bold text-rose-600">Taraksh Gautam</span> specifically for <span className="underline decoration-wavy decoration-pink-400 font-bold text-rose-600">Ryka Pritwani</span>, holding every cherished memory & secret story of <span className="text-rose-600 font-bold">#RyTa</span>."
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-rose-50/90 border border-rose-200 text-xs font-semibold text-rose-700 shadow-sm">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                Personalized Memory
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-rose-50/90 border border-rose-200 text-xs font-semibold text-rose-700 shadow-sm">
                <MessageCircleHeart className="w-3.5 h-3.5 text-rose-500" />
                Vault Access
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-rose-50/90 border border-rose-200 text-xs font-semibold text-rose-700 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                Private & Safe
              </span>
            </div>

            {/* ACTION BUTTONS WITH CHOICE MODAL TRIGGER */}
            <div className="pt-3 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <motion.button
                onClick={() => setShowChoiceModal(true)}
                whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(244,63,94,0.4)" }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-3.5 rounded-2xl bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base sm:text-lg shadow-xl shadow-rose-300/70 border border-rose-300 flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Get Started</span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/guest")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 rounded-2xl bg-white/90 hover:bg-rose-50/90 text-rose-700 font-bold text-sm sm:text-base border-2 border-rose-200/90 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-rose-500" />
                <span>Continue as Guest</span>
                <ArrowRight className="w-4 h-4 text-rose-500" />
              </motion.button>
            </div>

          </div>

          <div className="lg:col-span-5 flex items-center justify-center relative">
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-4 -right-2 z-20 bg-linear-to-r from-rose-500 to-pink-500 text-white px-4 py-1.5 rounded-full shadow-lg border border-white flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-[Caveat] text-base font-bold">Taraksh & Ryka</span>
            </motion.div>

            <motion.div
              whileHover={{ rotate: 0, scale: 1.02 }}
              className="relative w-full max-w-sm rounded-[2.5rem] p-2 bg-linear-to-b from-rose-200 via-pink-100 to-rose-300 shadow-2xl shadow-rose-300/50 -rotate-1 transition-all duration-500"
            >
              <div className="relative rounded-[2.2rem] overflow-hidden bg-white border border-rose-100">
                {/* Image Height Fix: h-[310px] & sm:h-[340px] */}
                <img
                  src="/us.png"
                  alt="Taraksh Gautam and Ryka Pritwani #RyTa"
                  className="w-full h[310px] sm:h[340px] object-cover object-center rounded-[2.2rem]"
                />
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-rose-950/80 via-rose-950/20 to-transparent p-4 flex items-end justify-between">
                  <div className="flex items-center gap-1.5 text-white">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500 ryta-heart-pulse" />
                    <span className="font-[Fredoka] text-xs font-bold tracking-wide">
                      #RyTa Memories
                    </span>
                  </div>
                  <span className="font-[Caveat] text-white/90 text-sm font-semibold">
                    The Muse 💖
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </motion.div>

      {/* CHOICE MODAL DIALOG (Matching Theme) */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-rose-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white/95 border-2 border-rose-200 rounded-[2.5rem] p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setShowChoiceModal(false)}
              className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto mb-3 text-rose-500 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Start Your Experience</h3>
              <p className="font-[Caveat] text-lg text-rose-800 font-semibold mt-0.5">Select how you want to chat with RyTa AI</p>
            </div>

            <div className="space-y-3">
              {/* Option A: Guest Mode */}
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  navigate("/guest");
                }}
                className="w-full p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 hover:bg-rose-100/60 text-left flex items-center gap-3 transition cursor-pointer group"
              >
                <div className="p-2 rounded-xl bg-rose-200/80 text-rose-700 group-hover:scale-105 transition">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Continue as Guest</div>
                  <div className="text-[10px] text-slate-500 font-medium">Quick start with basic features</div>
                </div>
              </button>

              {/* Option B: Signed In / Clerk Trigger Chat */}
              <button
                onClick={() => {
                  setShowChoiceModal(false);
                  handleChatClick();
                }}
                className="w-full p-3.5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:brightness-105 text-left flex items-center gap-3 transition cursor-pointer shadow-md shadow-rose-300/50"
              >
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {isSignedIn ? "Open Full AI Chat" : "Sign In to Access Full Chat"}
                  </div>
                  <div className="text-[10px] text-rose-100 font-medium">Unlocks complete memory & media features</div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Hero;