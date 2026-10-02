import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PanelLeft, Search, SquarePen, Share2 } from "lucide-react";
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

    const handleFocusSearch = useCallback(() => {
        if (!sidebarOpen) toggleSidebar();
        setSearchQuery("");
        setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>(
                'input[aria-label="Search chats"]'
            );
            input?.focus();
        }, 100);
    }, [sidebarOpen, toggleSidebar, setSearchQuery]);

    const handleShare = useCallback(async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: title || "Ryta chat",
                    url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                // Optional: toast notification
            }
        } catch {
            /* user cancelled */
        }
    }, [title]);

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
                {/* ─── Slim floating header ─── */}
                <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-14 items-center gap-3 px-3">
                    {/* Left: Logo + Capsule (only when sidebar is closed) */}
                    <div className="pointer-events-auto flex items-center gap-2">
                        {!sidebarOpen && (
                            <>
                                {/* Ryta logo */}
                                <img
                                    src="/logo.png"
                                    alt="Ryta"
                                    className="h-7 w-7 rounded-lg object-contain"
                                />

                                {/* Capsule with 3 icons */}
                                <div className="flex items-center gap-0.5 rounded-2xl border border-[var(--ryta-border)] bg-[var(--ryta-bg)]/85 p-1 backdrop-blur-md shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]">
                                    <button
                                        type="button"
                                        onClick={toggleSidebar}
                                        title="Show sidebar"
                                        aria-label="Show sidebar"
                                        className="flex h-7 w-7 items-center justify-center rounded-xl text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                                    >
                                        <PanelLeft className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleFocusSearch}
                                        title="Search chats"
                                        aria-label="Search chats"
                                        className="flex h-7 w-7 items-center justify-center rounded-xl text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                                    >
                                        <Search className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleNewChat}
                                        title="New chat"
                                        aria-label="New chat"
                                        className="flex h-7 w-7 items-center justify-center rounded-xl text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                                    >
                                        <SquarePen className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Middle: chat title */}
                    <div className="pointer-events-none flex min-w-0 flex-1 items-center justify-start">
                        {title && (
                            <h1 className="truncate text-[14px] font-medium text-[var(--ryta-text)]">
                                {title}
                            </h1>
                        )}
                    </div>

                    {/* Right: share */}
                    <div className="pointer-events-auto flex items-center gap-1">
                        {title && (
                            <button
                                type="button"
                                onClick={handleShare}
                                title="Share chat"
                                aria-label="Share chat"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                            >
                                <Share2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </header>

                {/* ─── Main content — pad top to avoid overlap ─── */}
                <main className="min-h-0 flex-1 overflow-hidden pt-14">
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