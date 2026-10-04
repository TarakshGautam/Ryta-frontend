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
    isStreaming?: boolean;
}

// Gradient capsule tints per mood family
const TONE_CLASS: Record<MoodTone, string> = {
    rose: "bg-gradient-to-r from-rose-500/15 to-pink-500/10 text-rose-600 dark:text-rose-300 border-rose-500/25 dark:border-rose-400/30",
    pink: "bg-gradient-to-r from-pink-500/15 to-fuchsia-500/10 text-pink-600 dark:text-pink-300 border-pink-500/25 dark:border-pink-400/30",
    blue: "bg-gradient-to-r from-blue-500/15 to-cyan-500/10 text-blue-600 dark:text-blue-300 border-blue-500/25 dark:border-blue-400/30",
    emerald:
        "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-400/30",
    zinc: "bg-gradient-to-r from-zinc-500/15 to-slate-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/25 dark:border-zinc-400/30",
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

// Strip reasoning leaks (nemotron style)
const REASONING_PATTERNS = [
    /^The user (said|wants|is asking)[^.]*\.\s*/i,
    /^I (need to|should|will|must)[^.]*\.\s*/i,
    /^Let me[^.]*\.\s*/i,
    /^Okay,? so[^.]*\.\s*/i,
    /^(Hmm|Alright|So),?[^.]*\.\s*/i,
    /^Based on[^.]*\.\s*/i,
];

function stripReasoning(text: string): string {
    let cleaned = text;
    let changed = true;
    while (changed) {
        changed = false;
        for (const pattern of REASONING_PATTERNS) {
            const newText = cleaned.replace(pattern, "");
            if (newText !== cleaned) {
                cleaned = newText;
                changed = true;
                break;
            }
        }
    }
    return cleaned.trim();
}

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
// Smooth typewriter
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

    useEffect(() => {
        setTargetText(text);
    }, [text]);

    useEffect(() => {
        if (!isStreaming) {
            setVisible(targetText);
            indexRef.current = targetText.length;
            return;
        }

        let cancelled = false;

        const loop = (now: number) => {
            if (cancelled) return;

            const elapsed = now - lastTickRef.current;

            if (elapsed >= 12 && indexRef.current < targetText.length) {
                const behind = targetText.length - indexRef.current;
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

    const { mood: extractedMood, clean: moodClean } = extractMood(message.text);
    const displayMood = message.mood ?? extractedMood;
    const displayText = stripReasoning(moodClean);

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

    // ─────────────────────────────────────────
    // USER — right aligned, soft rose tint
    // ─────────────────────────────────────────
    if (message.sender === "user") {
        return (
            <div className="flex justify-end ryta-message-in">
                <div
                    className="max-w-[80%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl rounded-br-md bg-[var(--ryta-user-bubble-bg)] text-[var(--ryta-user-bubble-fg)] text-[15px] leading-relaxed whitespace-pre-wrap break-words border border-[var(--ryta-border)]"
                    style={{ boxShadow: "var(--ryta-shadow-sm)" }}
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
    const tone = toneForMood(displayMood);
    const time = formatTime(message.timestamp);

    return (
        <div className="group w-full ryta-message-in">
            {/* Header: avatar + name + mood + search + time */}
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                {/* Persona avatar */}
                <div className="relative shrink-0">
                    <img
                        src={persona.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-[var(--ryta-border)]"
                    />
                    <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--ryta-bg)]"
                        aria-hidden="true"
                    />
                </div>

                <span className="font-serif text-[15.5px] font-semibold text-[var(--ryta-text)]">
                    {persona.name}
                </span>

                {displayMood && (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ryta-capsule-pop ${TONE_CLASS[tone ?? "zinc"]
                            }`}
                    >
                        {displayMood}
                    </span>
                )}

                {message.isSearchUsed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[var(--ryta-primary)]/25 bg-[var(--ryta-primary)]/10 text-[var(--ryta-primary)] text-[10px] font-semibold uppercase tracking-wider">
                        searched
                    </span>
                )}

                {time && !isStreaming && (
                    <span className="ml-auto text-[10.5px] text-[var(--ryta-text-subtle)] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                        {time}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="relative pl-[38px]">
                <TypewriterText text={displayText} isStreaming={isStreaming} />
                {isStreaming && (
                    <span
                        aria-hidden="true"
                        className="inline-block w-[2px] h-[1em] align-middle ml-0.5 bg-[var(--ryta-primary)] animate-[ryta-cursor-blink_1s_ease-in-out_infinite]"
                    />
                )}
            </div>

            {/* Actions */}
            {!isStreaming && (
                <div className="flex items-center gap-0.5 mt-2 pl-[38px] opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
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
                ? "text-[var(--ryta-primary)] bg-[var(--ryta-primary)]/10"
                : "text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]"
            }`}
    >
        {icon}
    </button>
);

export default ChatMessageBubble;