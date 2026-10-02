import React, { useEffect, useRef, useState } from "react";
import {
    Check,
    Copy,
    RefreshCw,
    ThumbsDown,
    ThumbsUp,
    Volume2,
    VolumeX,
} from "lucide-react";
import type { Message, MessageFeedback } from "@/types/chat";
import { PERSONAS, toneForMood, type MoodTone } from "@/types/chat";
import MarkdownRenderer from "./MarkdownRenderer";

interface ChatMessageBubbleProps {
    message: Message;
    onRegenerate?: (messageId: string) => void;
    onFeedback?: (messageId: string, feedback: MessageFeedback) => void;
    /** True while this AI message is actively streaming in */
    isStreaming?: boolean;
}

// Badge tint per mood family
const TONE_CLASS: Record<MoodTone, string> = {
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    pink: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    zinc: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

const formatTime = (date: Date): string => {
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};

// ─────────────────────────────────────────────
// Browser-native TTS — free, instant, no backend
// ─────────────────────────────────────────────
function useBrowserTTS() {
    const [speaking, setSpeaking] = useState(false);
    const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

    const stop = () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setSpeaking(false);
        utterRef.current = null;
    };

    const speak = (
        text: string,
        persona: "ryku" | "takshu"
    ) => {
        if (!("speechSynthesis" in window)) return;
        stop();

        const utter = new SpeechSynthesisUtterance(text);
        // Hinglish friendly — Indian English
        utter.lang = "en-IN";
        utter.rate = 0.95;
        utter.pitch = persona === "ryku" ? 1.15 : 0.9;

        // Pick a matching voice when possible
        const voices = window.speechSynthesis.getVoices();
        const preferred =
            voices.find(
                (v) =>
                    v.lang.startsWith("en-IN") ||
                    v.lang.startsWith("hi-IN")
            ) ||
            voices.find((v) => v.lang.startsWith("en")) ||
            voices[0];

        if (preferred) utter.voice = preferred;

        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);

        utterRef.current = utter;
        setSpeaking(true);
        window.speechSynthesis.speak(utter);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { speaking, speak, stop };
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
    message,
    onRegenerate,
    onFeedback,
    isStreaming = false,
}) => {
    const [copied, setCopied] = useState(false);
    const { speaking, speak, stop } = useBrowserTTS();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard blocked */
        }
    };

    const handleSpeak = () => {
        if (speaking) {
            stop();
            return;
        }
        const plain = message.text
            .replace(/\[MOOD:[A-Z_]+\]\s*/g, "")
            .slice(0, 2000);
        speak(plain, message.persona);
    };

    // ─────────────────────────────────────────
    // USER — right aligned
    // ─────────────────────────────────────────
    if (message.sender === "user") {
        return (
            <div className="flex justify-end">
                <div
                    className="max-w-[80%] sm:max-w-[65%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-[var(--ryta-user-bubble-bg)] text-[var(--ryta-user-bubble-fg)] text-[15px] leading-relaxed whitespace-pre-wrap break-words shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    title={formatTime(message.timestamp)}
                >
                    {message.text}
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────
    // AI — clean, no bubble
    // ─────────────────────────────────────────
    const persona = PERSONAS[message.persona];
    const tone = toneForMood(message.mood);
    const time = formatTime(message.timestamp);

    return (
        <div className="group w-full">
            {/* Header: name + mood + search + time */}
            <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                <span className="font-serif text-[15.5px] font-semibold text-[var(--ryta-text)]">
                    {persona.name}
                </span>

                {message.mood && (
                    <span
                        className={`px-1.5 py-px rounded-md text-[10px] font-medium uppercase tracking-wider ${TONE_CLASS[tone ?? "zinc"]
                            }`}
                    >
                        {message.mood}
                    </span>
                )}

                {message.isSearchUsed && (
                    <span className="px-1.5 py-px rounded-md text-[10px] font-medium uppercase tracking-wider bg-[var(--ryta-primary)]/10 text-[var(--ryta-primary)]">
                        searched
                    </span>
                )}

                {time && !isStreaming && (
                    <span className="ml-auto text-[10.5px] text-[var(--ryta-text-subtle)] tabular-nums">
                        {time}
                    </span>
                )}
            </div>

            {/* Body — markdown + streaming cursor */}
            <div className="relative">
                <MarkdownRenderer content={message.text} />
                {isStreaming && (
                    <span
                        aria-hidden="true"
                        className="inline-block w-[2px] h-[1em] align-middle ml-0.5 bg-[var(--ryta-primary)] animate-[ryta-cursor-blink_1s_ease-in-out_infinite]"
                    />
                )}
            </div>

            {/* Actions — hover on desktop, always on mobile */}
            {!isStreaming && (
                <div className="flex items-center gap-0.5 mt-2 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <ActionBtn
                        onClick={handleCopy}
                        title={copied ? "Copied" : "Copy"}
                        icon={
                            copied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )
                        }
                    />
                    <ActionBtn
                        onClick={handleSpeak}
                        title={speaking ? "Stop" : "Hear this"}
                        active={speaking}
                        icon={
                            speaking ? (
                                <VolumeX className="w-3.5 h-3.5" />
                            ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                            )
                        }
                    />
                    <ActionBtn
                        onClick={() =>
                            onFeedback?.(
                                message.id,
                                message.feedback === "liked" ? null : "liked"
                            )
                        }
                        title="This felt right"
                        active={message.feedback === "liked"}
                        icon={<ThumbsUp className="w-3.5 h-3.5" />}
                    />
                    <ActionBtn
                        onClick={() =>
                            onFeedback?.(
                                message.id,
                                message.feedback === "disliked"
                                    ? null
                                    : "disliked"
                            )
                        }
                        title="This missed the mark"
                        active={message.feedback === "disliked"}
                        icon={<ThumbsDown className="w-3.5 h-3.5" />}
                    />
                    {onRegenerate && (
                        <ActionBtn
                            onClick={() => onRegenerate(message.id)}
                            title="Regenerate"
                            icon={<RefreshCw className="w-3.5 h-3.5" />}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

const ActionBtn: React.FC<{
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
    active?: boolean;
}> = ({ onClick, title, icon, active = false }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        aria-pressed={active}
        className={`p-1.5 rounded-full transition-colors ${active
                ? "text-[var(--ryta-primary)] bg-[var(--ryta-surface)]"
                : "text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)]"
            }`}
    >
        {icon}
    </button>
);

export default ChatMessageBubble;