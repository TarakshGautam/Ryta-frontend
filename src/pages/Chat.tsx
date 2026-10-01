import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatArea from "@/components/chat/ChatArea";
import DiaryPanel from "@/components/diary/DiaryPanel";
import { useChatStore } from "@/store/chatStore";
import { useDocumentTitle } from "@/hooks/useDocumenttitle";

const ChatPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const navigate = useNavigate();

    const activeChatId = useChatStore((s) => s.activeChatId);
    const setActiveChatId = useChatStore((s) => s.setActiveChatId);
    const conversations = useChatStore((s) => s.conversations);
    const view = useChatStore((s) => s.view);

    const title =
        conversations.find((c) => c.id === activeChatId)?.title ?? null;

    useDocumentTitle(view === "diary" ? "Diary" : title || "Chat");

    // ─────────────────────────────────────────────────────────
    // Single source of truth:
    // URL is truth on mount, store is truth after mount.
    // When the URL changes (e.g. browser back/forward, or paste),
    // sync the store to match.
    // When the store changes (e.g. sidebar click), the caller
    // (Sidebar) must navigate — this component does NOT navigate.
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (conversationId === undefined) return;
        if (conversationId === activeChatId) return;
        setActiveChatId(conversationId || null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // ─────────────────────────────────────────────────────────
    // New chat — clear store, go to /chat
    // ─────────────────────────────────────────────────────────
    const handleNewChat = useCallback(() => {
        useChatStore.getState().startNewChat();
        navigate("/chat", { replace: true });
    }, [navigate]);

    // ─────────────────────────────────────────────────────────
    // Conversation just got created (first message sent)
    // ─────────────────────────────────────────────────────────
    const handleConversationCreated = useCallback(
        (id: string) => {
            setActiveChatId(id);
            navigate(`/chat/${id}`, { replace: true });
        },
        [setActiveChatId, navigate]
    );

    // ─────────────────────────────────────────────────────────
    // Keyboard: Cmd/Ctrl+K → new chat
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                handleNewChat();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleNewChat]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[var(--ryta-bg)] text-[var(--ryta-text)]">
            <Sidebar />

            <div className="relative flex h-full min-w-0 flex-1 flex-col">
                <ChatTopBar title={title} />

                <main className="min-h-0 flex-1 overflow-hidden">
                    {view === "diary" ? <DiaryPanel /> : null}
                    {view === "chat" ? (
                        <ChatArea
                            onConversationCreated={handleConversationCreated}
                        />
                    ) : null}
                </main>
            </div>
        </div>
    );
};

export default ChatPage;