import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Globe, Mic, MicOff } from "lucide-react";
import type { Attachment, Persona } from "@/types/chat";
import { PERSONA_ORDER, PERSONAS } from "@/types/chat";
import FileUploadButton from "./FileUploadButton";

interface PickedFile {
    url: string;
    name: string;
    type: string;
}

interface ChatComposerProps {
    persona: Persona;
    personaLabel: string;
    onPersonaChange: (persona: Persona) => void;
    onSend: (text: string, attachments: Attachment[]) => void;
    isLoading?: boolean;
    webSearchEnabled: boolean;
    onToggleWebSearch: () => void;
}

interface SpeechRecognitionLike {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionEventLike {
    resultIndex: number;
    results: {
        length: number;
        [index: number]: { [alt: number]: { transcript: string } };
    };
}

const getRecognitionCtor = (): (new () => SpeechRecognitionLike) | null => {
    const w = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const ChatComposer: React.FC<ChatComposerProps> = ({
    persona,
    personaLabel,
    onPersonaChange,
    onSend,
    isLoading = false,
    webSearchEnabled,
    onToggleWebSearch,
}) => {
    const [value, setValue] = useState("");
    const [listening, setListening] = useState(false);
    const [micSupported, setMicSupported] = useState(true);
    const [attachment, setAttachment] = useState<PickedFile | null>(null);
    const [focused, setFocused] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const baseTextRef = useRef("");

    useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [value]);

    useEffect(() => {
        const Ctor = getRecognitionCtor();
        if (!Ctor) {
            setMicSupported(false);
            return;
        }

        const recognition = new Ctor();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setValue(`${baseTextRef.current}${transcript}`.trimStart());
        };

        recognitionRef.current = recognition;
    }, []);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setListening(false);
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (listening) {
            stopListening();
            return;
        }
        baseTextRef.current = value ? `${value.trim()} ` : "";
        recognitionRef.current.start();
    };

    const canSend =
        (value.trim().length > 0 || attachment !== null) && !isLoading;

    const submit = useCallback(() => {
        const text = value.trim();
        if (!text && !attachment) return;
        if (isLoading) return;
        if (listening) stopListening();

        const attachments: Attachment[] = attachment
            ? [
                {
                    url: attachment.url,
                    type: attachment.type.startsWith("image/")
                        ? "image"
                        : "file",
                },
            ]
            : [];

        onSend(text || "What do you make of this?", attachments);
        setValue("");
        setAttachment(null);
        textareaRef.current?.focus();
    }, [value, attachment, isLoading, listening, stopListening, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== "Enter") return;
        if (e.shiftKey || e.nativeEvent.isComposing) return;
        e.preventDefault();
        submit();
    };

    return (
        <div className="shrink-0 w-full px-3 sm:px-4 pb-3 sm:pb-5 pt-2">
            <div className="mx-auto w-full max-w-3xl">
                {/* ─── COMPOSER BOX ─── */}
                <div
                    className={[
                        "relative rounded-3xl border bg-[var(--ryta-surface)] transition-all duration-300",
                        focused
                            ? "border-[var(--ryta-primary)]/50 shadow-[0_0_0_4px_var(--ryta-glow),0_8px_32px_-8px_var(--ryta-glow)]"
                            : "border-[var(--ryta-border)] shadow-sm",
                    ].join(" ")}
                >
                    <textarea
                        ref={textareaRef}
                        value={value}
                        rows={1}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder={
                            listening
                                ? "Listening…"
                                : `Message ${personaLabel}…`
                        }
                        className="w-full resize-none bg-transparent px-5 pt-4 pb-1 max-h-[200px] text-[15px] leading-6 text-[var(--ryta-text)] placeholder-[var(--ryta-text-subtle)] outline-none ryta-scroll"
                    />

                    <div className="flex items-center gap-2 px-3 pb-2.5 pt-1.5">
                        {/* Persona pills */}
                        <div
                            className="flex items-center gap-1.5 min-w-0"
                            role="radiogroup"
                            aria-label="Choose who to talk to"
                        >
                            {PERSONA_ORDER.map((p) => {
                                const active = p === persona;
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        disabled={isLoading}
                                        onClick={() => {
                                            if (!active) onPersonaChange(p);
                                        }}
                                        className={[
                                            "group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                                            active
                                                ? "bg-[var(--ryta-primary)]/12 text-[var(--ryta-text)] font-medium"
                                                : "text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={[
                                                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                                                active
                                                    ? "bg-[var(--ryta-primary)] shadow-[0_0_8px_var(--ryta-primary)]"
                                                    : "bg-[var(--ryta-text-subtle)] group-hover:bg-[var(--ryta-text-muted)]",
                                            ].join(" ")}
                                        />
                                        <span className="font-serif tracking-wide">
                                            {PERSONAS[p].name}
                                        </span>
                                        {active && (
                                            <motion.span
                                                layoutId="persona-active-ring"
                                                className="absolute inset-0 rounded-full border border-[var(--ryta-primary)]/40 pointer-events-none"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 35,
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex-1" />

                        {/* File upload */}
                        <FileUploadButton
                            currentFile={attachment}
                            onUpload={setAttachment}
                            onRemove={() => setAttachment(null)}
                        />

                        {/* Web search */}
                        <button
                            type="button"
                            onClick={onToggleWebSearch}
                            title="Let them look things up"
                            aria-label="Web search"
                            aria-pressed={webSearchEnabled}
                            className={[
                                "p-2 rounded-full transition-all duration-200",
                                webSearchEnabled
                                    ? "text-[var(--ryta-primary)] bg-[var(--ryta-primary)]/12 shadow-[0_0_12px_-2px_var(--ryta-glow)]"
                                    : "text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]",
                            ].join(" ")}
                        >
                            <Globe className="w-4 h-4" />
                        </button>

                        {/* Mic */}
                        <button
                            type="button"
                            onClick={toggleListening}
                            disabled={!micSupported}
                            title={
                                micSupported
                                    ? listening
                                        ? "Stop listening"
                                        : "Speak instead of typing"
                                    : "Voice input unavailable"
                            }
                            aria-label="Voice input"
                            className={[
                                "p-2 rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
                                listening
                                    ? "text-[var(--ryta-primary)] bg-[var(--ryta-primary)]/12 shadow-[0_0_12px_-2px_var(--ryta-glow)] ryta-heart-pulse"
                                    : "text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]",
                            ].join(" ")}
                        >
                            {listening ? (
                                <MicOff className="w-4 h-4" />
                            ) : (
                                <Mic className="w-4 h-4" />
                            )}
                        </button>

                        {/* Send */}
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!canSend}
                            title="Send"
                            aria-label="Send"
                            className={[
                                "p-2 rounded-full transition-all duration-200",
                                canSend
                                    ? "bg-[var(--ryta-primary)] text-[var(--ryta-primary-fg)] shadow-[0_0_16px_-4px_var(--ryta-glow)] hover:bg-[var(--ryta-primary-hover)] hover:shadow-[0_0_24px_-4px_var(--ryta-glow)] hover:scale-105 active:scale-95"
                                    : "bg-[var(--ryta-surface-raised)] text-[var(--ryta-text-subtle)] cursor-not-allowed",
                            ].join(" ")}
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Hint */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={webSearchEnabled ? "search-on" : "search-off"}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 px-2 text-[11px] text-[var(--ryta-text-subtle)] flex items-center gap-1.5 justify-center"
                    >
                        {webSearchEnabled ? (
                            <>
                                <Globe className="w-3 h-3" />
                                Web search is on — they may look things up.
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">
                                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--ryta-border)] bg-[var(--ryta-surface)] text-[10px] font-mono">
                                        Enter
                                    </kbd>{" "}
                                    to send ·{" "}
                                    <kbd className="px-1.5 py-0.5 rounded border border-[var(--ryta-border)] bg-[var(--ryta-surface)] text-[10px] font-mono">
                                        Shift + Enter
                                    </kbd>{" "}
                                    for a new line
                                </span>
                                <span className="sm:hidden">
                                    Tap send when ready
                                </span>
                            </>
                        )}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ChatComposer;