import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
    ArrowDown,
    MessageCircle,
    Compass,
    Sparkles,
    Heart,
} from "lucide-react";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatComposer from "./ChatComposer";
import {
    sendMessageWithQueue,
    generateConversationTitle,
} from "@/services/chatApi";
import { getConversationMessages } from "@/services/conversationApi";
import { useChatStore } from "@/store/chatStore";
import { usePersonaSwitch } from "./usePersonaSwitch";
import { useTheme } from "@/context/ThemeContext";
import {
    PERSONAS,
    PERSONA_THEME,
    type Attachment,
    type Message,
} from "@/types/chat";

interface ChatAreaProps {
    onConversationCreated?: (conversationId: string) => void;
}

interface SuggestionItem {
    text: string;
    subtitle: string;
    icon: React.ReactNode;
}

const SUGGESTIONS: Record<string, SuggestionItem[]> = {
    ryku: [
        {
            text: "Aaj mood kharab tha, bolu?",
            subtitle: "Kuch share karna hai? Main sun rahi hoon.",
            icon: <Heart className="w-4 h-4" />,
        },
        {
            text: "Meri favourite films yaad kar",
            subtitle: "Baat karte hain uske baare mein",
            icon: <Sparkles className="w-4 h-4" />,
        },
        {
            text: "Thoda time nikal ke baat karni hai",
            subtitle: "Main yahan hoon, jab bhi chaho",
            icon: <MessageCircle className="w-4 h-4" />,
        },
    ],
    takshu: [
        {
            text: "Scene kya hai, bata",
            subtitle: "Kuch bhi share karo, main hu na",
            icon: <MessageCircle className="w-4 h-4" />,
        },
        {
            text: "Career ke baare mein sochna hai",
            subtitle: "Baat karte hain iske baare mein",
            icon: <Compass className="w-4 h-4" />,
        },
        {
            text: "Kuch bhi bol, main hu na",
            subtitle: "Main yahan hoon, sun raha hoon",
            icon: <Sparkles className="w-4 h-4" />,
        },
    ],
};

const ChatArea: React.FC<ChatAreaProps> = ({ onConversationCreated }) => {
    const { user } = useUser();
    const userId = user?.id;

    const messages = useChatStore((s) => s.messages);
    const setMessages = useChatStore((s) => s.setMessages);
    const appendMessage = useChatStore((s) => s.appendMessage);
    const updateMessage = useChatStore((s) => s.updateMessage);
    const persona = useChatStore((s) => s.persona);
    const activeChatId = useChatStore((s) => s.activeChatId);
    const setActiveChatId = useChatStore((s) => s.setActiveChatId);
    const upsertConversation = useChatStore((s) => s.upsertConversation);
    const isSending = useChatStore((s) => s.isSending);
    const setIsSending = useChatStore((s) => s.setIsSending);
    const messagesLoading = useChatStore((s) => s.messagesLoading);
    const setMessagesLoading = useChatStore((s) => s.setMessagesLoading);
    const webSearchEnabled = useChatStore((s) => s.webSearchEnabled);
    const toggleWebSearch = useChatStore((s) => s.toggleWebSearch);
    const error = useChatStore((s) => s.error);
    const setError = useChatStore((s) => s.setError);

    const handlePersonaChange = usePersonaSwitch();
    const { setThemeName } = useTheme();

    const scrollRef = useRef<HTMLDivElement>(null);
    const sendingRef = useRef(false);
    const [atBottom, setAtBottom] = useState(true);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    }, []);

    const scrollToBottomAfterPaint = useCallback(
        (behavior: ScrollBehavior = "auto") => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToBottom(behavior);
                });
            });
        },
        [scrollToBottom]
    );

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        setAtBottom(distance < 120);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!activeChatId || !userId) {
                setMessages([]);
                scrollToBottomAfterPaint("auto");
                return;
            }

            setMessagesLoading(true);
            setError(null);

            try {
                const rows = await getConversationMessages(
                    userId,
                    activeChatId
                );
                if (cancelled) return;

                const loaded: Message[] = rows.map((r) => ({
                    id: r.id,
                    sender: r.sender === "user" ? "user" : "ai",
                    text: r.content,
                    persona: r.persona ?? persona,
                    mood: r.mood,
                    isSearchUsed: r.isSearchUsed,
                    timestamp: r.createdAt
                        ? new Date(r.createdAt)
                        : new Date(),
                }));

                setMessages(loaded);
                setAtBottom(true);
                scrollToBottomAfterPaint("auto");

                const owner = loaded[0]?.persona;
                if (owner && owner !== persona) {
                    useChatStore.getState().setPersona(owner);
                    setThemeName(PERSONA_THEME[owner]);
                }
            } catch (e) {
                if (cancelled) return;
                console.error("Could not load conversation:", e);
                setMessages([]);
                setError(
                    e instanceof Error
                        ? e.message
                        : "Could not load this conversation."
                );
            } finally {
                if (!cancelled) setMessagesLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChatId, userId]);

    const prevMessagesLengthRef = useRef<number>(0);

    useEffect(() => {
        if (messagesLoading) return;

        const prev = prevMessagesLengthRef.current;
        const current = messages.length;
        prevMessagesLengthRef.current = current;

        if (current > prev && prev > 0) {
            scrollToBottom("smooth");
        }
    }, [messages.length, messagesLoading, scrollToBottom]);

    useEffect(() => {
        if (isSending) scrollToBottom("smooth");
    }, [isSending, scrollToBottom]);

    // ⚡ Deliver — streaming with real-time typing
    const deliver = useCallback(
        async (
            text: string,
            useSearch: boolean,
            attachments: Attachment[] = []
        ) => {
            if (sendingRef.current) return;
            sendingRef.current = true;
            setIsSending(true);
            setError(null);

            const optimisticId = `local-${crypto.randomUUID()}`;
            const streamingId = `streaming-${crypto.randomUUID()}`;

            // ── Add user message immediately ──
            appendMessage({
                id: optimisticId,
                sender: "user",
                text,
                persona,
                timestamp: new Date(),
            });

            // ── Add placeholder AI message ──
            appendMessage({
                id: streamingId,
                sender: "ai",
                text: "",
                persona,
                mood: null,
                isSearchUsed: false,
                timestamp: new Date(),
            });

            setTimeout(() => scrollToBottom("smooth"), 50);

            try {
                const result = await sendMessageWithQueue(
                    userId as string,
                    {
                        message: text,
                        conversationId: activeChatId,
                        persona,
                        webSearch: useSearch,
                        attachments,
                    },
                    (pollUrl) => {
                        console.log("[ChatArea] Queued → poll:", pollUrl);
                    },
                    (partialText) => {
                        // ⚡ Real-time typing effect
                        updateMessage(streamingId, { text: partialText });
                        scrollToBottom("auto");
                    }
                );

                // ── New conversation — register ──
                if (!activeChatId) {
                    setActiveChatId(result.conversationId);
                    upsertConversation({
                        id: result.conversationId,
                        title: text.slice(0, 48),
                        persona,
                        updated_at: new Date().toISOString(),
                    });
                    onConversationCreated?.(result.conversationId);

                    if (userId) {
                        generateConversationTitle(
                            userId,
                            result.conversationId,
                            text
                        )
                            .then((aiTitle) => {
                                if (aiTitle) {
                                    useChatStore
                                        .getState()
                                        .updateConversation(
                                            result.conversationId,
                                            { title: aiTitle }
                                        );
                                }
                            })
                            .catch(() => {
                                /* silent */
                            });
                    }
                }

                // ── Final update ──
                updateMessage(optimisticId, { id: result.userMessageId });
                updateMessage(streamingId, {
                    id: result.assistantMessageId,
                    text: result.message,
                    mood: result.mood,
                    isSearchUsed: result.isSearchUsed,
                });
            } catch (e) {
                console.error("Send failed:", e);
                setMessages(
                    useChatStore
                        .getState()
                        .messages.filter((m) => m.id !== streamingId)
                );
                setError(
                    e instanceof Error
                        ? e.message
                        : "That did not go through. Try again."
                );
            } finally {
                sendingRef.current = false;
                setIsSending(false);
            }
        },
        [
            userId,
            persona,
            activeChatId,
            appendMessage,
            updateMessage,
            setMessages,
            setActiveChatId,
            upsertConversation,
            setIsSending,
            setError,
            onConversationCreated,
            scrollToBottom,
        ]
    );

    const handleRegenerate = useCallback(
        (messageId: string) => {
            const index = messages.findIndex((m) => m.id === messageId);
            if (index < 0 || sendingRef.current) return;

            let prompt = "";
            let promptIndex = -1;
            for (let i = index - 1; i >= 0; i--) {
                if (messages[i].sender === "user") {
                    prompt = messages[i].text;
                    promptIndex = i;
                    break;
                }
            }
            if (!prompt) return;

            setMessages(messages.slice(0, promptIndex));
            void deliver(prompt, webSearchEnabled);
        },
        [messages, setMessages, deliver, webSearchEnabled]
    );

    const handleFeedback = useCallback(
        (messageId: string, feedback: "liked" | "disliked" | null) => {
            setMessages(
                messages.map((m) =>
                    m.id === messageId ? { ...m, feedback } : m
                )
            );
        },
        [messages, setMessages]
    );

    const meta = PERSONAS[persona];

    return (
        <div className="flex flex-col h-full min-h-0">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto ryta-scroll"
            >
                <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 space-y-6">
                    {messagesLoading ? (
                        <div className="py-16 flex justify-center">
                            <Thinking />
                        </div>
                    ) : messages.length === 0 ? (
                        <EmptyState
                            persona={persona}
                            onPick={(text) => void deliver(text, false)}
                        />
                    ) : (
                        messages.map((m) => (
                            <ChatMessageBubble
                                key={m.id}
                                message={m}
                                onRegenerate={handleRegenerate}
                                onFeedback={handleFeedback}
                                isStreaming={
                                    isSending && m.id.startsWith("streaming-")
                                }
                            />
                        ))
                    )}

                    {error && (
                        <p className="text-[12.5px] text-[var(--ryta-text-muted)] border-l-2 border-[var(--ryta-primary)] pl-3">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            {!atBottom && messages.length > 0 && (
                <div className="relative flex justify-center">
                    <button
                        type="button"
                        onClick={() => scrollToBottom("smooth")}
                        aria-label="Jump to newest message"
                        className="absolute -top-10 p-2 rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] transition-all hover:scale-105 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)]"
                    >
                        <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <ChatComposer
                persona={persona}
                onPersonaChange={handlePersonaChange}
                onSend={(text, attachments) =>
                    void deliver(text, webSearchEnabled, attachments)
                }
                isLoading={isSending}
                webSearchEnabled={webSearchEnabled}
                onToggleWebSearch={toggleWebSearch}
                personaLabel={meta.name}
            />
        </div>
    );
};

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────
const EmptyState: React.FC<{
    persona: "ryku" | "takshu";
    onPick: (text: string) => void;
}> = ({ persona, onPick }) => {
    const meta = PERSONAS[persona];
    const suggestions = SUGGESTIONS[persona] ?? [];

    const copy = {
        ryku: {
            eyebrow: "Ryku is here",
            headline: "Kya baat karni hai?",
            subline: "Main sun rahi hoon — kuch bhi share karo.",
        },
        takshu: {
            eyebrow: "Takshu is here",
            headline: "Bol, kya scene hai?",
            subline: "Main hu na. Kuch bhi bol.",
        },
    }[persona];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center pt-16 sm:pt-24 pb-10"
        >
            <div className="relative mb-6">
                <div
                    aria-hidden
                    className="absolute inset-0 rounded-full blur-2xl opacity-60"
                    style={{
                        background:
                            "radial-gradient(circle, var(--ryta-glow) 0%, transparent 70%)",
                    }}
                />
                <img
                    src={meta.avatar}
                    alt=""
                    className="relative w-16 h-16 rounded-full object-cover ring-1 ring-[var(--ryta-border)] shadow-[0_8px_32px_-8px_var(--ryta-glow)]"
                />
            </div>

            <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--ryta-text-subtle)] mb-3">
                {copy.eyebrow}
            </p>

            <h1 className="text-[28px] sm:text-[34px] leading-[1.15] font-semibold tracking-[-0.02em] text-[var(--ryta-text)] max-w-lg mb-3">
                {copy.headline}
            </h1>

            <p className="text-[14.5px] leading-relaxed text-[var(--ryta-text-muted)] max-w-md mb-10">
                {copy.subline}
            </p>

            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suggestions.map((s, i) => (
                    <motion.button
                        key={s.text}
                        type="button"
                        onClick={() => onPick(s.text)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.25,
                            delay: 0.15 + i * 0.05,
                            ease: "easeOut",
                        }}
                        className="group flex items-start gap-3 rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-surface)]/40 px-4 py-3.5 text-left transition-all duration-150 hover:border-[var(--ryta-primary)]/40 hover:bg-[var(--ryta-surface)] hover:shadow-[0_4px_20px_-8px_var(--ryta-glow)]"
                    >
                        <span className="mt-0.5 shrink-0 text-[var(--ryta-text-subtle)] group-hover:text-[var(--ryta-primary)] transition-colors">
                            {s.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block text-[13.5px] font-medium text-[var(--ryta-text)] leading-snug">
                                {s.text}
                            </span>
                            <span className="block mt-0.5 text-[12px] text-[var(--ryta-text-muted)] leading-relaxed">
                                {s.subtitle}
                            </span>
                        </span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// Thinking indicator
// ─────────────────────────────────────────────
const Thinking: React.FC = () => (
    <div
        className="flex items-center gap-1.5 px-1 py-1"
        aria-label="Thinking"
    >
        {[0, 150, 300].map((delay) => (
            <span
                key={delay}
                style={{
                    animationDelay: `${delay}ms`,
                    background:
                        "linear-gradient(135deg, var(--ryta-primary), var(--ryta-primary-hover))",
                    boxShadow: "0 0 10px -2px var(--ryta-primary)",
                }}
                className="h-2 w-2 rounded-full ryta-thinking-dot"
            />
        ))}
    </div>
);

export default ChatArea;