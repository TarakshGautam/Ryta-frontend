import { useTheme } from "../context/ThemeContext";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { SignInButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  ArrowUp,
  Sparkles,
  Lock,
  MessageCircle,
} from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumenttitle";
import { Moon, Sun } from "lucide-react";

// const { resolvedAppearance, toggleTheme } = useTheme();
// const isDark = resolvedAppearance === "dark";

// ─────────────────────────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────────────────────────
const RAW_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "").replace(/\/api$/, "");

const GUEST_ID_KEY = "ryta_guest_id";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { [index: number]: { transcript: string } };
  };
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  mood?: string | null;
}

interface ParsedAIResponse {
  mood: string | null;
  body: string;
}

// ─────────────────────────────────────────────────────────────
// MOOD STYLES
// ─────────────────────────────────────────────────────────────
const MOOD_STYLES: Record<string, string> = {
  FRIENDLY: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  LOVING: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
  PLAYFUL: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/25",
  CURIOUS: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  NAKHRA: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/25",
  SERIOUS: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/25",
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getOrCreateGuestId(): string {
  let gId = localStorage.getItem(GUEST_ID_KEY);
  if (!gId) {
    gId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_ID_KEY, gId);
  }
  return gId;
}

function parseAIResponse(rawText: string): ParsedAIResponse {
  const moodMatch = rawText.match(/^\[MOOD:([A-Z_]+)\]\s*/);
  const mood = moodMatch ? moodMatch[1] : null;
  const body = rawText.replace(/^\[MOOD:[A-Z_]+\]\s*/, "").trim();
  return { mood, body };
}

function formatTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

const MoodBadge: React.FC<{ mood: string }> = ({ mood }) => {
  const style = MOOD_STYLES[mood] ?? MOOD_STYLES.FRIENDLY;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-medium tracking-wide uppercase ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {mood.toLowerCase()}
    </span>
  );
};

// Formatted AI text renderer
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const renderInline = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-[var(--ryta-text)]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return (
          <em key={idx} className="italic text-[var(--ryta-text-muted)]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1">
              <span className="text-[var(--ryta-primary)] mt-2 text-[8px]">
                ●
              </span>
              <p className="text-[15px] leading-7 text-[var(--ryta-text)] flex-1">
                {renderInline(trimmed.substring(2))}
              </p>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s+(.*)/);
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <span className="text-[var(--ryta-primary)] font-mono text-sm font-semibold mt-0.5">
                  {match[1]}
                </span>
                <p className="text-[15px] leading-7 text-[var(--ryta-text)] flex-1">
                  {renderInline(match[2])}
                </p>
              </div>
            );
          }
        }

        return (
          <p
            key={idx}
            className="text-[15px] leading-7 text-[var(--ryta-text)]"
          >
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};

// Thinking indicator
const ThinkingIndicator: React.FC = () => (
  <div className="flex items-center gap-2.5 py-2">
    <div className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--ryta-primary)] animate-pulse" />
      <span
        className="w-1.5 h-1.5 rounded-full bg-[var(--ryta-primary)] animate-pulse"
        style={{ animationDelay: "250ms" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-[var(--ryta-primary)] animate-pulse"
        style={{ animationDelay: "400ms" }}
      />
    </div>
    <span className="text-xs text-[var(--ryta-text-muted)] font-medium">
      Ryku is thinking…
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export const GuestPage: React.FC = () => {
  useDocumentTitle("Guest");
  // ✅ Hook call INSIDE the component
  const { isDark, toggleTheme } = useTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<
    Record<string, "up" | "down" | null>
  >({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, isLoading]);

  // ─────────────────────────────────────────────────────────
  // Text-to-speech
  // ─────────────────────────────────────────────────────────
  const speakFeminineVoice = useCallback(
    (text: string, msgId: string) => {
      if (!("speechSynthesis" in window)) return;

      if (playingId === msgId) {
        window.speechSynthesis.cancel();
        setPlayingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/\[MOOD:[A-Z_]+\]/g, "")
        .replace(/[*_#`~]/g, "")
        .trim();

      const triggerSpeech = () => {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();

        const feminineVoice =
          voices.find((v) => v.lang.includes("hi") || v.lang.includes("IN")) ||
          voices.find(
            (v) =>
              v.name.includes("Google UK English Female") ||
              v.name.includes("Zira") ||
              v.name.includes("Samantha") ||
              v.name.includes("Swara") ||
              v.name.includes("Heera") ||
              v.name.toLowerCase().includes("female")
          ) ||
          voices.find((v) => v.lang.startsWith("en"));

        if (feminineVoice) utterance.voice = feminineVoice;
        utterance.pitch = 1.35;
        utterance.rate = 0.95;

        utterance.onend = () => setPlayingId(null);
        utterance.onerror = () => setPlayingId(null);

        setPlayingId(msgId);
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          triggerSpeech();
          window.speechSynthesis.onvoiceschanged = null;
        };
      } else {
        triggerSpeech();
      }
    },
    [playingId]
  );

  const copyToClipboard = useCallback((text: string, id: string) => {
    const cleanText = text.replace(/\[MOOD:[A-Z_]+\]/g, "").trim();
    void navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const toggleFeedback = useCallback((id: string, type: "up" | "down") => {
    setLikedMap((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  }, []);

  // ─────────────────────────────────────────────────────────
  // Voice input
  // ─────────────────────────────────────────────────────────
  const handleVoiceInput = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => ISpeechRecognition;
      webkitSpeechRecognition?: new () => ISpeechRecognition;
    };
    const SpeechRecognitionClass =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Voice recognition is not supported on your browser.");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) setInputValue(transcript);
    };

    recognition.start();
  }, [isListening]);

  // ─────────────────────────────────────────────────────────
  // Send query
  // ─────────────────────────────────────────────────────────
  const sendQuery = useCallback(
    async (queryText: string, historyPayload = messages) => {
      if (!queryText.trim() || isLoading) return;

      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        sender: "user",
        text: queryText,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsLoading(true);

      getOrCreateGuestId(); // ensure ID exists

      const endpoint = `${API_BASE_URL}/api/guest/chat`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: queryText,
            history: historyPayload.map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
          }),
        });

        const json = (await response.json()) as {
          success?: boolean;
          data?: { reply?: string; mood?: string };
          error?: string;
        };

        let aiReply =
          "Ryku is having trouble responding right now. Please try again in a moment.";
        let mood: string | null = null;

        if (json?.success && json?.data?.reply) {
          aiReply = json.data.reply;
          mood = json.data.mood || null;
        } else if (json?.error) {
          aiReply = json.error;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "ai",
            text: aiReply,
            timestamp: formatTime(),
            mood,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "ai",
            text: "Connection lost. Please check your network and try again.",
            timestamp: formatTime(),
            mood: "SERIOUS",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, isListening]
  );

  const handleRegenerate = useCallback(() => {
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.sender === "user");
    if (lastUserMsg) {
      const trimmedHistory = messages.filter((m) => m.id !== lastUserMsg.id);
      void sendQuery(lastUserMsg.text, trimmedHistory);
    }
  }, [messages, sendQuery]);

  const handleSend = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      void sendQuery(inputValue);
    },
    [inputValue, sendQuery]
  );

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col antialiased overflow-hidden bg-[var(--ryta-bg)] text-[var(--ryta-text)]">
      {/* Pink wash — top gradient */}
      <div className="absolute inset-x-0 top-0 h-[55%] pointer-events-none bg-gradient-to-b from-[var(--ryta-primary)]/14 via-[var(--ryta-primary)]/5 to-transparent" />

      {/* Ambient glow blobs */}
      <div className="absolute top-[-20%] left-[-15%] w-[55%] h-[55%] rounded-full bg-[var(--ryta-primary)]/18 blur-[140px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--ryta-primary)]/12 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--ryta-primary)]/10 blur-[120px] pointer-events-none" />
      {/* ────── HEADER ────── */}
      <header className="relative z-30 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[var(--ryta-border)] bg-[var(--ryta-bg)]/70 backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-10 h-10 rounded-full ring-2 ring-[var(--ryta-primary)]/30 p-0.5 bg-[var(--ryta-surface)]">
              <img
                src="/logo.png"
                alt="Ryku"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[var(--ryta-bg)]" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-semibold text-[var(--ryta-text)] tracking-tight">
                Ryku
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--ryta-surface)] text-[var(--ryta-text-muted)] border border-[var(--ryta-border)] font-medium">
                <Lock className="w-2.5 h-2.5" />
                Private
              </span>
            </div>
            <span className="text-[11px] text-[var(--ryta-text-subtle)]">
              A quiet conversation, just for you
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light" : "Switch to dark"}
            className="p-2 rounded-full border border-[var(--ryta-border)] bg-[var(--ryta-surface)] text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)] transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <SignInButton mode="modal">
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-[var(--ryta-primary)] text-[var(--ryta-primary-fg)] hover:opacity-90 font-medium text-xs tracking-wide shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Sign in
            </button>
          </SignInButton>
        </div>
      </header>

      {/* ────── MAIN ────── */}
      <main className="relative z-10 flex-1 overflow-y-auto ryta-scroll">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 min-h-full flex flex-col">
          {messages.length === 0 ? (
            /* Empty state — left-aligned, intentional */
            <div className="my-auto max-w-lg mx-auto w-full space-y-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--ryta-surface)] border border-[var(--ryta-border)] text-[var(--ryta-text-muted)] text-[11px] font-medium">
                  <Sparkles className="w-3 h-3" />
                  Guest mode
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ryta-text)] leading-tight tracking-tight">
                  Say something to Ryku.
                </h1>

                <p className="text-[15px] text-[var(--ryta-text-muted)] leading-7 max-w-md">
                  She listens, teases, and cares. This is a private space —
                  nothing you say here is saved. Sign in anytime to keep the
                  memory going.
                </p>
              </motion.div>

              {/* Suggestion rows */}
              <div className="space-y-2 pt-4">
                {[
                  { icon: MessageCircle, text: "How are you feeling today?" },
                  { icon: Heart, text: "Tell me something sweet." },
                  { icon: Sparkles, text: "I need someone to talk to." },
                ].map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    onClick={() => void sendQuery(s.text)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-surface)] hover:bg-[var(--ryta-surface-raised)] hover:border-[var(--ryta-border-strong)] transition-colors text-left group"
                  >
                    <s.icon className="w-4 h-4 text-[var(--ryta-primary)] shrink-0" />
                    <span className="text-sm text-[var(--ryta-text)]">
                      {s.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-6 flex-1">
              {messages.map((msg) => {
                if (msg.sender === "user") {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl rounded-tr-md bg-[var(--ryta-user-bubble-bg)] text-[var(--ryta-user-bubble-fg)] text-[15px] leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                const { mood, body } = msg.mood
                  ? { mood: msg.mood, body: msg.text }
                  : parseAIResponse(msg.text);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-full group"
                  >
                    {/* Sender label + mood */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-serif text-[15px] font-semibold text-[var(--ryta-text)]">
                        Ryku
                      </span>
                      {mood && <MoodBadge mood={mood} />}
                    </div>

                    {/* Body — no bubble */}
                    <div className="pl-0">
                      <FormattedText text={body} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                      <ActionBtn
                        onClick={() => toggleFeedback(msg.id, "up")}
                        title="This felt right"
                        active={likedMap[msg.id] === "up"}
                        icon={<ThumbsUp className="w-3.5 h-3.5" />}
                      />
                      <ActionBtn
                        onClick={() => toggleFeedback(msg.id, "down")}
                        title="This missed the mark"
                        active={likedMap[msg.id] === "down"}
                        icon={<ThumbsDown className="w-3.5 h-3.5" />}
                      />
                      <ActionBtn
                        onClick={handleRegenerate}
                        title="Say it again"
                        icon={<RefreshCw className="w-3.5 h-3.5" />}
                      />
                      <ActionBtn
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        title="Keep these words"
                        icon={
                          copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                      />
                      <div className="flex-1" />
                      <ActionBtn
                        onClick={() => speakFeminineVoice(msg.text, msg.id)}
                        title={
                          playingId === msg.id
                            ? "Stop speaking"
                            : "Hear her say it"
                        }
                        active={playingId === msg.id}
                        icon={
                          playingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )
                        }
                      />
                    </div>
                  </motion.div>
                );
              })}

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <ThinkingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* ────── FOOTER ────── */}
      <footer className="relative z-20 w-full px-4 sm:px-6 pb-4 pt-2 shrink-0">
        <form
          onSubmit={handleSend}
          className="max-w-3xl mx-auto p-2 rounded-3xl border border-[var(--ryta-border)] bg-[var(--ryta-surface)] focus-within:border-[var(--ryta-border-strong)] shadow-sm flex items-end gap-2 transition-colors"
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${isListening
                ? "bg-[var(--ryta-primary)] text-[var(--ryta-primary-fg)] animate-pulse"
                : "text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]"
              }`}
            title={isListening ? "Stop listening" : "Speak instead of typing"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendQuery(inputValue);
              }
            }}
            placeholder={
              isListening ? "Listening…" : "Talk with Ryku…"
            }
            rows={1}
            className="flex-1 bg-transparent px-2 py-3 text-[15px] text-[var(--ryta-text)] placeholder-[var(--ryta-text-subtle)] focus:outline-none resize-none max-h-32 ryta-scroll"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3 rounded-2xl bg-[var(--ryta-primary)] text-[var(--ryta-primary-fg)] hover:opacity-90 disabled:bg-[var(--ryta-surface-raised)] disabled:text-[var(--ryta-text-subtle)] transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
            title="Send"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Action button
// ─────────────────────────────────────────────────────────────
const ActionBtn: React.FC<{
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  active?: boolean;
}> = ({ onClick, title, icon, active }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-md transition-colors ${active
        ? "text-[var(--ryta-primary)] bg-[var(--ryta-surface-raised)]"
        : "text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]"
      }`}
  >
    {icon}
  </button>
);

export default GuestPage;