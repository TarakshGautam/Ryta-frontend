import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PanelLeft, Search, SquarePen, Share2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useChatStore } from "@/store/chatStore";
import { useDocumentTitle } from "@/hooks/useDocumenttitle";
import "@/styles/chat.css";

// ─────────────────────────────────────────────
// Header Icon Button — reusable
// ─────────────────────────────────────────────
const HeaderIconButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ onClick, title, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        className="chat-icon-btn"
    >
        {children}
    </button>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
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

    // ─── Sync URL → active chat ───
    useEffect(() => {
        if (conversationId === undefined) {
            // No chat in URL — clear active
            if (activeChatId !== null) setActiveChatId(null);
            return;
        }
        if (conversationId === activeChatId) return;
        setActiveChatId(conversationId || null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // ─── Handlers ───
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
            }
        } catch {
            /* user cancelled */
        }
    }, [title]);

    // ─── Keyboard shortcut: Cmd/Ctrl + K = New chat ───
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
        <div className="chat-root">
            <Sidebar />

            <div className="chat-main">
                {/* ─── Floating Header ─── */}
                <header className="chat-header">
                    {/* Left: Logo + Capsule (when sidebar closed) */}
                    <div className="chat-header-left">
                        {!sidebarOpen && (
                            <>
                                <img
                                    src="/logo.png"
                                    alt="Ryta"
                                    className="chat-logo"
                                />

                                <div className="chat-capsule">
                                    <HeaderIconButton
                                        onClick={toggleSidebar}
                                        title="Show sidebar"
                                    >
                                        <PanelLeft size={16} />
                                    </HeaderIconButton>

                                    <HeaderIconButton
                                        onClick={handleFocusSearch}
                                        title="Search chats"
                                    >
                                        <Search size={16} />
                                    </HeaderIconButton>

                                    <HeaderIconButton
                                        onClick={handleNewChat}
                                        title="New chat"
                                    >
                                        <SquarePen size={16} />
                                    </HeaderIconButton>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Middle: chat title */}
                    <div className="chat-header-center">
                        {title && (
                            <h1 className="chat-header-title">{title}</h1>
                        )}
                    </div>

                    {/* Right: share */}
                    <div className="chat-header-right">
                        {title && (
                            <HeaderIconButton
                                onClick={handleShare}
                                title="Share chat"
                            >
                                <Share2 size={16} />
                            </HeaderIconButton>
                        )}
                    </div>
                </header>

                {/* ─── Main Content ─── */}
                <main className="chat-content">
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