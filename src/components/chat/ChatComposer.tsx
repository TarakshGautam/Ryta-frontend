import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
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

// Minimal shape of the Web Speech API — not in lib.dom.
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

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const baseTextRef = useRef("");

    // ── Auto-grow ──
    useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [value]);

    // ── Voice input ──
    useEffect(() => {
        const Ctor = getRecognitionCtor();
        if (!Ctor) {
            setMicSupported(false);
            return;
        }

        const recognition = new Ctor();
        recognition.continuous = false;
        recognition.interimResults = true;
        // The whole app speaks Hinglish.
        recognition.lang = "en-IN";

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            // Keep whatever was typed before dictation started.
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

    // ── Send ──
    const canSend =
        (value.trim().length > 0 || attachment !== null) && !isLoading;

    const submit = useCallback(() => {
        const text = value.trim();
        if (!text && !attachment) return;
        if (isLoading) return;
        if (listening) stopListening();

        // The Worker only understands coarse kinds, not MIME types.
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
        // Let the IME finish before we treat Enter as a send.
        if (e.shiftKey || e.nativeEvent.isComposing) return;
        e.preventDefault();
        submit();
    };

    return (
        <div className="shrink-0 w-full px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
            <div className="mx-auto w-full max-w-3xl">
                <div className="rounded-2xl border border-[var(--ryta-border)] bg-[var(--ryta-surface)] transition-colors focus-within:border-[var(--ryta-border-strong)]">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        rows={1}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            listening
                                ? "Listening…"
                                : `Message ${personaLabel}…`
                        }
                        className="w-full resize-none bg-transparent px-4 pt-3 pb-1 max-h-[200px] text-[15px] leading-6 text-[var(--ryta-text)] placeholder-[var(--ryta-text-subtle)] outline-none ryta-scroll"
                    />

                    <div className="flex items-center gap-1 px-2.5 pb-2 pt-1.5">
                        {/* Who you're talking to */}
                        <div
                            className="flex items-center gap-3 min-w-0"
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
                                            "flex items-center gap-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                                            active
                                                ? "text-[var(--ryta-text)]"
                                                : "text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)]",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full border transition-colors ${
                                                active
                                                    ? "bg-[var(--ryta-primary)] border-[var(--ryta-primary)]"
                                                    : "border-[var(--ryta-text-subtle)]"
                                            }`}
                                        />
                                        <span
                                            className={`text-xs ${
                                                active
                                                    ? "font-medium"
                                                    : ""
                                            }`}
                                        >
                                            {PERSONAS[p].name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex-1" />

                        {/* Share something */}
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
                            className={`p-1.5 rounded-full transition-colors ${
                                webSearchEnabled
                                    ? "text-[var(--ryta-primary)] bg-[var(--ryta-surface-raised)]"
                                    : "text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]"
                            }`}
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
                            className={`p-1.5 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                listening
                                    ? "text-[var(--ryta-primary)] bg-[var(--ryta-surface-raised)]"
                                    : "text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface-raised)]"
                            }`}
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
                            className={`p-1.5 rounded-full transition-colors ${
                                canSend
                                    ? "bg-[var(--ryta-primary)] text-[var(--ryta-primary-fg)] hover:bg-[var(--ryta-primary-hover)]"
                                    : "bg-[var(--ryta-surface-raised)] text-[var(--ryta-text-subtle)] cursor-not-allowed"
                            }`}
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <p className="mt-1.5 px-1 text-[11px] text-[var(--ryta-text-subtle)]">
                    {webSearchEnabled
                        ? "Web search is on — they may look things up."
                        : "Enter to send · Shift + Enter for a new line"}
                </p>
            </div>
        </div>
    );
};

export default ChatComposer;
