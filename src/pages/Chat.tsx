import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PanelLeft, Search, SquarePen } from "lucide-react";
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
    const setSearchQuery = useChatStore((s) => s.setSearchQuery);

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

    // Focus search: opens sidebar (if closed) + focuses search input
    const handleFocusSearch = useCallback(() => {
        if (!sidebarOpen) toggleSidebar();
        setSearchQuery("");
        // Give sidebar a moment to mount
        setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>(
                'input[aria-label="Search chats"]'
            );
            input?.focus();
        }, 100);
    }, [sidebarOpen, toggleSidebar, setSearchQuery]);

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
                {/* ─── Floating pill (DeepSeek-style) ─── */}
                <div className="pointer-events-none absolute left-3 top-3 z-20">
                    <div className="pointer-events-auto flex items-center gap-0.5 rounded-2xl border border-[var(--ryta-border)] bg-[var(--ryta-bg)]/85 p-1 backdrop-blur-md shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]">
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            title={
                                sidebarOpen ? "Hide sidebar" : "Show sidebar"
                            }
                            aria-label="Toggle sidebar"
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                        >
                            <PanelLeft className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={handleFocusSearch}
                            title="Search chats"
                            aria-label="Search chats"
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                        >
                            <Search className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={handleNewChat}
                            title="New chat"
                            aria-label="New chat"
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                        >
                            <SquarePen className="h-4 w-4" />
                        </button>
                    </div>
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