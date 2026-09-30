import React, { useEffect, useRef, useState } from "react";
import {
    Check,
    Copy,
    RefreshCw,
    ThumbsDown,
    ThumbsUp,
    Volume2,
} from "lucide-react";
import type { Message, MessageFeedback } from "@/types/chat";
import { PERSONAS, toneForMood, type MoodTone } from "@/types/chat";
import { fetchSpeechAudio } from "@/services/chatApi";
import MarkdownRenderer from "./MarkdownRenderer";

interface ChatMessageBubbleProps {
    message: Message;
    onRegenerate?: (messageId: string) => void;
    onFeedback?: (messageId: string, feedback: MessageFeedback) => void;
}

// Badge tint per mood family. Alpha backgrounds keep these
// readable on both the cream and burgundy palettes.
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

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
    message,
    onRegenerate,
    onFeedback,
}) => {
    const [copied, setCopied] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);

    const stopSpeech = () => {
        audioRef.current?.pause();
        audioRef.current = null;
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
        setSpeaking(false);
    };

    // Don't leave audio running when the bubble unmounts
    // (switching conversations, regenerating, etc).
    useEffect(() => stopSpeech, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            /* clipboard blocked */
        }
    };

    const handleSpeak = async () => {
        if (speaking) {
            stopSpeech();
            return;
        }

        const plain = message.text
            .replace(/\[MOOD:[A-Z_]+\]\s*/g, "")
            .slice(0, 2000);

        try {
            const blob = await fetchSpeechAudio(plain);
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audioUrlRef.current = url;
            audioRef.current = audio;
            audio.onended = stopSpeech;
            audio.onerror = stopSpeech;

            setSpeaking(true);
            await audio.play();
        } catch {
            setSpeaking(false);
        }
    };

    // ─────────────────────────────────────────
    // USER — right aligned, one soft bubble
    // ─────────────────────────────────────────
    if (message.sender === "user") {
        return (
            <div className="flex justify-end">
                <div
                    className="max-w-[80%] sm:max-w-[65%] px-3 py-2 rounded-xl bg-[var(--ryta-user-bubble-bg)] text-[var(--ryta-user-bubble-fg)] text-[15px] leading-relaxed whitespace-pre-wrap break-words"
                    title={formatTime(message.timestamp)}
                >
                    {message.text}
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────
    // AI — no bubble, name carries the weight
    // ─────────────────────────────────────────
    const persona = PERSONAS[message.persona];
    const tone = toneForMood(message.mood);
    const time = formatTime(message.timestamp);

    return (
        <div className="group w-full">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                <span className="font-serif text-[15px] font-semibold text-[var(--ryta-text)]">
                    {persona.name}
                </span>

                {message.mood && (
                    <span
                        className={`px-1.5 py-px rounded-md text-[10px] font-medium uppercase tracking-wider ${
                            TONE_CLASS[tone ?? "zinc"]
                        }`}
                    >
                        {message.mood}
                    </span>
                )}

                {message.isSearchUsed && (
                    <span className="text-[10px] uppercase tracking-wider text-[var(--ryta-text-subtle)]">
                        searched
                    </span>
                )}

                {time && (
                    <span className="ml-auto text-[10.5px] text-[var(--ryta-text-subtle)] tabular-nums">
                        {time}
                    </span>
                )}
            </div>

            <MarkdownRenderer content={message.text} />

            {/* Actions — thumb-reachable on mobile, hover-only on desktop */}
            <div className="flex items-center gap-0.5 mt-1.5 opacity-100 transition-opacity duration-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <ActionBtn
                    onClick={handleCopy}
                    title="Keep these words"
                    icon={
                        copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )
                    }
                />
                <ActionBtn
                    onClick={handleSpeak}
                    title={speaking ? "Stop" : "Hear this"}
                    active={speaking}
                    icon={<Volume2 className="w-3.5 h-3.5" />}
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
                        title="Say it again"
                        icon={<RefreshCw className="w-3.5 h-3.5" />}
                    />
                )}
            </div>
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
        className={`p-1.5 rounded-full transition-colors ${
            active
                ? "text-[var(--ryta-primary)] bg-[var(--ryta-surface)]"
                : "text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)]"
        }`}
    >
        {icon}
    </button>
);

export default ChatMessageBubble;
