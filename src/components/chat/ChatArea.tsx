import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { useUser } from "@clerk/clerk-react";
import { ArrowDown } from "lucide-react";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatComposer from "./ChatComposer";
import { sendMessage } from "@/services/chatApi";
import { getConversationMessages } from "@/services/conversationApi";
import { useChatStore } from "@/store/chatStore";
import { usePersonaSwitch } from "./usePersonaSwitch";
import { useTheme } from "@/context/ThemeContext";
import { PERSONAS, PERSONA_THEME, type Attachment, type Message } from "@/types/chat";

interface ChatAreaProps {
    onConversationCreated?: (conversationId: string) => void;
}

const SUGGESTIONS: Record<string, string[]> = {
    ryku: [
        "Aaj mood kharab tha, bolu?",
        "Meri favourite films yaad kar",
        "Thoda time nikal ke baat karni hai",
    ],
    takshu: [
        "Scene kya hai, bata",
        "Career ke baare mein sochna hai",
        "Kuch bhi bol, main hu na",
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

    // ── Scroll helpers ──
    const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    }, []);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        setAtBottom(distance < 120);
    };

    // Jump to the newest message the moment one lands.
    // ── Auto-scroll: instant on chat switch, smooth on new message ──
    const prevChatIdRef = useRef<string | null>(null);
    const prevMessageCountRef = useRef<number>(0);

    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const chatChanged = prevChatIdRef.current !== activeChatId;
        const newMessage =
            messages.length > prevMessageCountRef.current && !chatChanged;

        // Update refs
        prevChatIdRef.current = activeChatId;
        prevMessageCountRef.current = messages.length;

        // Don't scroll while loading
        if (messagesLoading) return;

        if (chatChanged) {
            // Instantly jump to bottom (chat switched)
            el.scrollTop = el.scrollHeight;
        } else if (newMessage) {
            // Smooth scroll for new messages
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        }
    }, [activeChatId, messages.length, messagesLoading]);

    // Reset the scroll position when we land in a different thread.
    useEffect(() => {
        setAtBottom(true);
    }, [activeChatId]);

    // ── Load history ──
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!activeChatId || !userId) {
                setMessages([]);
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
                    timestamp: r.createdAt ? new Date(r.createdAt) : new Date(),
                }));

                // Set messages FIRST (so UI shows immediately)
                setMessages(loaded);

                // THEN derive persona + theme from owner
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
                    e instanceof Error ? e.message : "Could not load this conversation."
                );
            } finally {
                if (!cancelled) {
                    setMessagesLoading(false);
                }
            }

        void load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChatId, userId]);

    // ── Send ──
    const deliver = useCallback(
        async (text: string, useSearch: boolean, attachments: Attachment[] = []) => {
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

                // The Worker names a new thread after the opening line.
                if (!activeChatId) {
                    setActiveChatId(result.conversationId);
                    upsertConversation({
                        id: result.conversationId,
                        title: text.slice(0, 48),
                        persona,
                        updated_at: new Date().toISOString(),
                    });
                    onConversationCreated?.(result.conversationId);
                }

                // Use the real ids so a reload lines up.
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
                setMessages(
                    messages.filter((m) => m.id !== optimisticId)
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
        ]
    );

    // ── Regenerate ──
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

    // ── Feedback (local only — no endpoint yet) ──
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
            {/* ── Stream ── */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto ryta-scroll"
            >
                <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 space-y-6">
                    {messagesLoading ? (
                        <p className="py-16 text-center text-[13px] text-[var(--ryta-text-subtle)]">
                            Opening…
                        </p>
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

                    {isSending && <Thinking />}

                    {error && (
                        <p className="text-[12.5px] text-[var(--ryta-text-muted)] border-l-2 border-[var(--ryta-primary)] pl-3">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            {/* Jump to newest */}
            {!atBottom && messages.length > 0 && (
                <div className="relative flex justify-center">
                    <button
                        type="button"
                        onClick={() => scrollToBottom("smooth")}
                        aria-label="Jump to newest message"
                        className="absolute -top-10 p-1.5 rounded-lg border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] transition-colors"
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
// Empty state — left aligned, editorial
// ─────────────────────────────────────────────

const EmptyState: React.FC<{
    persona: "ryku" | "takshu";
    onPick: (text: string) => void;
}> = ({ persona, onPick }) => {
    const meta = PERSONAS[persona];

    return (
        <div className="py-12 sm:py-16">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ryta-text-subtle)]">
                {meta.name}
            </p>
            <h2 className="mt-3 font-serif text-2xl sm:text-[28px] leading-snug font-semibold text-[var(--ryta-text)] max-w-lg">
                {meta.greeting}
            </h2>
            <p className="mt-2 text-[13.5px] text-[var(--ryta-text-muted)] max-w-md leading-relaxed">
                {meta.description}
            </p>

            <div className="mt-6 space-y-0 border-l border-[var(--ryta-border)] max-w-md">
                {(SUGGESTIONS[persona] ?? []).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => onPick(s)}
                        className="block w-full text-left px-3 py-2 text-[13.5px] text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] border-b border-[var(--ryta-border)] transition-colors"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Thinking indicator
// ─────────────────────────────────────────────

const Thinking: React.FC = () => (
    <div className="flex items-center gap-1.5" aria-label="Thinking">
        {[0, 150, 300].map((delay) => (
            <span
                key={delay}
                style={{ animationDelay: `${delay}ms` }}
                className="w-1 h-1 rounded-full bg-[var(--ryta-text-subtle)] animate-pulse"
            />
        ))}
    </div>
);

export default ChatArea;
