import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PanelLeft, SquarePen } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useChatStore } from "@/store/chatStore";
import { useDocumentTitle } from "@/hooks/useDocumenttitle";

const ChatPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const navigate = useNavigate();

    const activeChatId = useChatStore((s) => s.activeChatId);
    const setActiveChatId = useChatStore((s) => s.setActiveChatId);
    const conversations = useChatStore((s) => s.conversations);
    const view = useChatStore((s) => s.view);
    const sidebarOpen = useChatStore((s) => s.sidebarOpen);
    const toggleSidebar = useChatStore((s) => s.toggleSidebar);

    const title =
        conversations.find((c) => c.id === activeChatId)?.title ?? null;

    useDocumentTitle(view === "diary" ? "Diary" : title || "Chat");

    // URL ↔ store sync
    useEffect(() => {
        if (conversationId === undefined) return;
        if (conversationId === activeChatId) return;
        setActiveChatId(conversationId || null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    const handleNewChat = useCallback(() => {
        useChatStore.getState().startNewChat();
        navigate("/chat", { replace: true });
    }, [navigate]);

    const handleConversationCreated = useCallback(
        (id: string) => {
            setActiveChatId(id);
            navigate(`/chat/${id}`, { replace: true });
        },
        [setActiveChatId, navigate]
    );

    // Cmd/Ctrl+K → new chat
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
                {/* ─── Floating top-left controls (DeepSeek-style) ─── */}
                <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                        aria-label="Toggle sidebar"
                        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-bg)]/80 text-[var(--ryta-text-muted)] backdrop-blur-sm transition-colors hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)]"
                    >
                        <PanelLeft className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={handleNewChat}
                        title="New chat"
                        aria-label="New chat"
                        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-bg)]/80 text-[var(--ryta-text-muted)] backdrop-blur-sm transition-colors hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)]"
                    >
                        <SquarePen className="h-4 w-4" />
                    </button>
                </div>

                <main className="min-h-0 flex-1 overflow-hidden">
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