import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowDown, MessageCircle, Compass, Sparkles, Heart } from "lucide-react";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatComposer from "./ChatComposer";
import { sendMessage, generateConversationTitle } from "@/services/chatApi";
import { getConversationMessages } from "@/services/conversationApi";
import { useChatStore } from "@/store/chatStore";
import { usePersonaSwitch } from "./usePersonaSwitch";
import { useTheme } from "@/context/ThemeContext";
import { PERSONAS, PERSONA_THEME, type Attachment, type Message } from "@/types/chat";

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
                const rows = await getConversationMessages(userId, activeChatId);
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

            appendMessage({
                id: optimisticId,
                sender: "user",
                text,
                persona,
                timestamp: new Date(),
            });

            try {
                const result = await sendMessage(userId as string, {
                    message: text,
                    conversationId: activeChatId,
                    persona,
                    webSearch: useSearch,
                    attachments,
                });

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
                                        .updateConversation(result.conversationId, {
                                            title: aiTitle,
                                        });
                                }
                            })
                            .catch(() => {
                                /* silent */
                            });
                    }
                }

                updateMessage(optimisticId, { id: result.userMessageId });

                appendMessage({
                    id: result.assistantMessageId,
                    sender: "ai",
                    text: result.message,
                    persona,
                    mood: result.mood,
                    isSearchUsed: result.isSearchUsed,
                    timestamp: new Date(),
                });
            } catch (e) {
                console.error("Send failed:", e);
                setMessages(messages.filter((m) => m.id !== optimisticId));
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
                            />
                        ))
                    )}

                    {isSending && (
                        <div className="flex justify-start pl-1">
                            <Thinking />
                        </div>
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="py-12 sm:py-16 flex flex-col items-center text-center"
        >
            <img
                src={meta.avatar}
                alt=""
                className="w-12 h-12 rounded-2xl object-cover mb-4 shadow-[0_0_40px_-8px_var(--ryta-glow)]"
            />

            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ryta-text-subtle)]">
                {meta.name}
            </p>

            <h2 className="mt-3 font-serif text-[26px] sm:text-[32px] leading-snug text-[var(--ryta-text)] max-w-lg">
                {meta.greeting}
            </h2>

            <p className="mt-3 text-[13.5px] text-[var(--ryta-text-muted)] max-w-md leading-relaxed">
                {meta.description}
            </p>

            <div className="mt-8 w-full max-w-md space-y-2">
                {suggestions.map((s, i) => (
                    <motion.button
                        key={s.text}
                        type="button"
                        onClick={() => onPick(s.text)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.25,
                            delay: 0.1 + i * 0.05,
                            ease: "easeOut",
                        }}
                        className="group flex w-full items-start gap-3 rounded-2xl border border-[var(--ryta-border)] bg-[var(--ryta-surface)]/50 px-4 py-3 text-left transition-all duration-200 hover:border-[var(--ryta-primary)]/40 hover:bg-[var(--ryta-surface)] hover:shadow-[0_4px_20px_-8px_var(--ryta-glow)]"
                    >
                        <span className="mt-0.5 shrink-0 text-[var(--ryta-text-subtle)] group-hover:text-[var(--ryta-primary)] transition-colors">
                            {s.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block text-[13.5px] font-medium text-[var(--ryta-text)]">
                                {s.text}
                            </span>
                            <span className="block mt-0.5 text-[12px] text-[var(--ryta-text-muted)]">
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
// Thinking indicator — bouncing gradient dots
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