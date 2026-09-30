import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatArea from "@/components/chat/ChatArea";
import DiaryPanel from "@/components/diary/DiaryPanel";
import { useChatStore } from "@/store/chatStore";
import { useDocumentTitle } from "@/hooks/useDocumenttitle";

/**
 * Two columns and nothing else: threads on the left, one
 * conversation on the right. No third rail, no floating chrome.
 */
const ChatPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const navigate = useNavigate();

    const activeChatId = useChatStore((s) => s.activeChatId);
    const setActiveChatId = useChatStore((s) => s.setActiveChatId);
    const conversations = useChatStore((s) => s.conversations);
    const view = useChatStore((s) => s.view);

    // Title comes from the thread list, not a separate field.
    const title =
        conversations.find((c) => c.id === activeChatId)?.title ?? null;

    useDocumentTitle(view === "diary" ? "Diary" : title || "Chat");

    // Route → store, in both directions.
    useEffect(() => {
        if (conversationId && conversationId !== activeChatId) {
            setActiveChatId(conversationId);
        }
    }, [conversationId, activeChatId, setActiveChatId]);

    const handleConversationCreated = useCallback(
        (id: string) => {
            setActiveChatId(id);
            navigate(`/chat/${id}`, { replace: true });
        },
        [setActiveChatId, navigate]
    );

    const handleNewChat = useCallback(() => {
        useChatStore.getState().startNewChat();
        navigate("/chat", { replace: true });
    }, [navigate]);

    // Keep the URL honest when a thread is opened from the sidebar.
    useEffect(() => {
        if (!activeChatId) return;
        if (conversationId !== activeChatId) {
            navigate(`/chat/${activeChatId}`, { replace: true });
        }
    }, [activeChatId, conversationId, navigate]);

    // Cmd/Ctrl+K — new thread
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
