import { create } from "zustand";
import type {
    ConversationSummary,
    Message,
    Persona,
} from "@/types/chat";
import { DEFAULT_PERSONA } from "@/types/chat";

export type WorkspaceView = "chat" | "diary";

interface ChatState {
    // ── Data ──
    messages: Message[];
    conversations: ConversationSummary[];

    // ── Identity ──
    activeChatId: string | null;
    persona: Persona;

    // ── UI ──
    sidebarOpen: boolean;
    searchQuery: string;
    isSending: boolean;
    webSearchEnabled: boolean;
    view: WorkspaceView;

    // ── Flags ──
    messagesLoading: boolean;
    conversationsLoading: boolean;
    error: string | null;

    // ── Messages ──
    setMessages: (messages: Message[]) => void;
    appendMessage: (message: Message) => void;
    updateMessage: (id: string, patch: Partial<Message>) => void;
    clearMessages: () => void;

    // ── Conversations ──
    setConversations: (list: ConversationSummary[]) => void;
    upsertConversation: (conversation: ConversationSummary) => void;
    updateConversation: (
        id: string,
        patch: Partial<ConversationSummary>
    ) => void;
    removeConversation: (id: string) => void;
    setActiveChatId: (id: string | null) => void;
    setMessagesLoading: (loading: boolean) => void;
    setConversationsLoading: (loading: boolean) => void;

    // ── Persona ──
    setPersona: (persona: Persona) => void;
    switchPersona: (persona: Persona) => void;

    // ── UI toggles ──
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSearchQuery: (query: string) => void;
    toggleWebSearch: () => void;
    setIsSending: (sending: boolean) => void;
    setView: (view: WorkspaceView) => void;
    setError: (error: string | null) => void;

    // ── Composite ──
    startNewChat: () => void;
}

const isDesktop = () =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true;

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    conversations: [],

    activeChatId: null,
    persona: DEFAULT_PERSONA,

    sidebarOpen: isDesktop(),
    searchQuery: "",
    isSending: false,
    webSearchEnabled: false,
    view: "chat",

    messagesLoading: false,
    conversationsLoading: false,
    error: null,

    // ── Messages ──
    setMessages: (messages) => set({ messages }),
    appendMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),
    updateMessage: (id, patch) =>
        set((s) => ({
            messages: s.messages.map((m) =>
                m.id === id ? { ...m, ...patch } : m
            ),
        })),
    clearMessages: () => set({ messages: [] }),

    // ── Conversations ──
    setConversations: (conversations) => set({ conversations }),
    upsertConversation: (conversation) =>
        set((s) => {
            const exists = s.conversations.some(
                (c) => c.id === conversation.id
            );
            return {
                conversations: exists
                    ? s.conversations.map((c) =>
                          c.id === conversation.id
                              ? { ...c, ...conversation }
                              : c
                      )
                    : [conversation, ...s.conversations],
            };
        }),
    updateConversation: (id, patch) =>
        set((s) => ({
            conversations: s.conversations.map((c) =>
                c.id === id ? { ...c, ...patch } : c
            ),
        })),
    removeConversation: (id) =>
        set((s) => ({
            conversations: s.conversations.filter((c) => c.id !== id),
        })),
    setActiveChatId: (id) => set({ activeChatId: id }),
    setMessagesLoading: (messagesLoading) => set({ messagesLoading }),
    setConversationsLoading: (conversationsLoading) =>
        set({ conversationsLoading }),

    // ── Persona ──
    setPersona: (persona) => set({ persona }),
    // Switching souls starts a clean room, same as a new chat.
    switchPersona: (persona) =>
        set((s) => {
            if (persona === s.persona) return s;
            return {
                persona,
                activeChatId: null,
                messages: [],
                error: null,
            };
        }),

    // ── UI ──
    toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    toggleWebSearch: () =>
        set((s) => ({ webSearchEnabled: !s.webSearchEnabled })),
    setIsSending: (isSending) => set({ isSending }),
    setView: (view) => set({ view }),
    setError: (error) => set({ error }),

    // ── Composite ──
    startNewChat: () =>
        set({
            activeChatId: null,
            messages: [],
            error: null,
            view: "chat",
        }),
}));
