import React, { useEffect, useRef, useState, useLayoutEffect, } from "react";
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
    isStreaming?: boolean;
}

const TONE_CLASS: Record<MoodTone, string> = {
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 dark:border-rose-400/25",
    pink: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20 dark:border-pink-400/25",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 dark:border-blue-400/25",
    emerald:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-400/25",
    zinc: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 dark:border-zinc-400/25",
};

const formatTime = (date: Date): string => {
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};

// Mood extraction — handles multiple AI output formats
const MOOD_PATTERNS = [
    /\[MOOD:\s*([A-Z_]+)\s*\]/i,
    /\bOD:\s*([A-Z_]+)\s*\]/i,
    /MOOD:\s*([A-Z_]+)\s*\]/i,
    /\[MOOD:\s*([A-Z_]+)/i,
];

function extractMood(text: string): { mood: string | null; clean: string } {
    for (const pattern of MOOD_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            const mood = match[1].toUpperCase();
            const clean = text.replace(match[0], "").trim();
            return { mood, clean };
        }
    }
    return { mood: null, clean: text };
}

// ─────────────────────────────────────────────
// Browser-native TTS
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

    const speak = (text: string, persona: "ryku" | "takshu") => {
        if (!("speechSynthesis" in window)) return;
        stop();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-IN";
        utter.rate = 0.95;
        utter.pitch = persona === "ryku" ? 1.15 : 0.9;

        const voices = window.speechSynthesis.getVoices();
        const preferred =
            voices.find(
                (v) => v.lang.startsWith("en-IN") || v.lang.startsWith("hi-IN")
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

    useEffect(() => {
        return () => {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { speaking, speak, stop };
}

// ─────────────────────────────────────────────
// Simple typewriter for streaming
// ─────────────────────────────────────────────
const TypewriterText: React.FC<{
    text: string;
    isStreaming: boolean;
}> = ({ text, isStreaming }) => {
    const [visible, setVisible] = useState(isStreaming ? "" : text);
    const [targetText, setTargetText] = useState(text);
    const rafRef = useRef<number | null>(null);
    const lastTickRef = useRef<number>(0);
    const indexRef = useRef(0);

    // Update target whenever new text arrives
    useLayoutEffect(() => {
        setTargetText(text);
    }, [text]);

    // Animation loop
    useLayoutEffect(() => {
        if (!isStreaming) {
            // Instant complete on stream end
            setVisible(targetText);
            indexRef.current = targetText.length;
            return;
        }

        let cancelled = false;

        const loop = (now: number) => {
            if (cancelled) return;

            const elapsed = now - lastTickRef.current;

            // ~12ms per char baseline
            if (elapsed >= 12 && indexRef.current < targetText.length) {
                const behind = targetText.length - indexRef.current;
                // Catch up faster if far behind
                const reveal = behind > 40 ? 3 : behind > 15 ? 2 : 1;

                indexRef.current = Math.min(
                    indexRef.current + reveal,
                    targetText.length
                );
                setVisible(targetText.slice(0, indexRef.current));
                lastTickRef.current = now;
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            cancelled = true;
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [targetText, isStreaming]);

    return <MarkdownRenderer content={visible} />;
};

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
    message,
    onRegenerate,
    onFeedback,
    isStreaming = false,
}) => {
    const [copied, setCopied] = useState(false);
    const { speaking, speak, stop } = useBrowserTTS();

    const { mood: extractedMood, clean: cleanText } = extractMood(message.text);
    const displayMood = message.mood ?? extractedMood;
    const displayText = cleanText;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(displayText);
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
        speak(displayText.slice(0, 2000), message.persona);
    };

    // USER
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

    // AI
    const persona = PERSONAS[message.persona];
    const tone = toneForMood(displayMood);
    const time = formatTime(message.timestamp);

    return (
        <div className="group w-full">
            <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                <span className="font-serif text-[15.5px] font-semibold text-[var(--ryta-text)]">
                    {persona.name}
                </span>

                {displayMood && (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${TONE_CLASS[tone ?? "zinc"]
                            }`}
                    >
                        {displayMood}
                    </span>
                )}

                {message.isSearchUsed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-[var(--ryta-primary)]/20 bg-[var(--ryta-primary)]/10 text-[var(--ryta-primary)] text-[10px] font-semibold uppercase tracking-wider">
                        searched
                    </span>
                )}

                {time && !isStreaming && (
                    <span className="ml-auto text-[10.5px] text-[var(--ryta-text-subtle)] tabular-nums">
                        {time}
                    </span>
                )}
            </div>

            <div className="relative">
                <TypewriterText text={displayText} isStreaming={isStreaming} />
            </div>

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
                                message.feedback === "disliked" ? null : "disliked"
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