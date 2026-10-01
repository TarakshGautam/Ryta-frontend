import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Archive,
    BookOpen,
    MessageSquare,
    Moon,
    MoreHorizontal,
    PanelLeftClose,
    PanelLeftOpen,
    Pencil,
    Pin,
    PinOff,
    Plus,
    Search,
    Settings as SettingsIcon,
    Sparkles,
    Sun,
    Trash2,
    X,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import {
    archiveConversation,
    deleteConversation,
    listConversations,
    pinConversation,
    renameConversation,
} from "@/services/conversationApi";
import { useChatStore } from "@/store/chatStore";
import { useTheme } from "@/context/ThemeContext";
import { PERSONA_THEME, type ConversationSummary } from "@/types/chat";
import Settings from "./Settings";
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/types";

type DateGroup = "Today" | "Yesterday" | "Previous 7 days" | "Older";

const GROUP_ORDER: DateGroup[] = [
    "Today",
    "Yesterday",
    "Previous 7 days",
    "Older",
];

const groupFor = (iso?: string): DateGroup => {
    if (!iso) return "Older";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Older";

    const now = new Date();
    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    ).getTime();
    const t = date.getTime();
    const day = 24 * 60 * 60 * 1000;

    if (t >= startOfToday) return "Today";
    if (t >= startOfToday - day) return "Yesterday";
    if (t >= startOfToday - 7 * day) return "Previous 7 days";
    return "Older";
};

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
    const { user } = useUser();
    const userId = user?.id;
    const { setThemeName, resolvedAppearance, toggleTheme } = useTheme();

    const sidebarOpen = useChatStore((s) => s.sidebarOpen);
    const toggleSidebar = useChatStore((s) => s.toggleSidebar);
    const collapsed = useChatStore((s) => s.collapsed);
    const toggleCollapsed = useChatStore((s) => s.toggleCollapsed);

    const conversations = useChatStore((s) => s.conversations);
    const setConversations = useChatStore((s) => s.setConversations);
    const loading = useChatStore((s) => s.conversationsLoading);
    const setLoading = useChatStore((s) => s.setConversationsLoading);
    const activeChatId = useChatStore((s) => s.activeChatId);
    const setActiveChatId = useChatStore((s) => s.setActiveChatId);
    const setPersona = useChatStore((s) => s.setPersona);
    const searchQuery = useChatStore((s) => s.searchQuery);
    const setSearchQuery = useChatStore((s) => s.setSearchQuery);
    const view = useChatStore((s) => s.view);
    const setView = useChatStore((s) => s.setView);
    const startNewChat = useChatStore((s) => s.startNewChat);
    const updateConversation = useChatStore((s) => s.updateConversation);
    const removeConversation = useChatStore((s) => s.removeConversation);

    const [menuFor, setMenuFor] = useState<string | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [deleting, setDeleting] =
        useState<ConversationSummary | null>(null);
    const [busy, setBusy] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    const menuRef = useRef<HTMLDivElement>(null);
    const renameRef = useRef<HTMLInputElement>(null);

    const isDark = resolvedAppearance === "dark";

    // ── Load threads ──
    const load = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            setConversations(await listConversations(userId));
        } catch (e) {
            console.error("Could not load conversations:", e);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [userId, setConversations, setLoading]);

    useEffect(() => {
        void load();
    }, [load]);

    // Close menu on outside click
    useEffect(() => {
        if (!menuFor) return;
        const onDown = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setMenuFor(null);
            }
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [menuFor]);

    useEffect(() => {
        if (renaming) {
            renameRef.current?.focus();
            renameRef.current?.select();
        }
    }, [renaming]);

    // ── Filter + group ──
    const { pinned, groups, total } = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const matching = conversations.filter((c) =>
            query ? c.title.toLowerCase().includes(query) : true
        );

        const isPinned = matching.filter((c) => Boolean(c.is_pinned));
        const rest = matching.filter((c) => !c.is_pinned);

        const buckets: Record<DateGroup, ConversationSummary[]> = {
            Today: [],
            Yesterday: [],
            "Previous 7 days": [],
            Older: [],
        };
        for (const c of rest) {
            buckets[groupFor(c.updated_at ?? c.created_at)].push(c);
        }

        return { pinned: isPinned, groups: buckets, total: matching.length };
    }, [conversations, searchQuery]);

    // ── Handlers ──
    const closeOnMobile = () => {
        if (window.innerWidth < 1024) toggleSidebar();
    };

    const openConversation = (c: ConversationSummary) => {
        setActiveChatId(c.id);
        setPersona(c.persona);
        setThemeName(PERSONA_THEME[c.persona]);
        setView("chat");
        closeOnMobile();
    };

    const handleNewChat = () => {
        startNewChat();
        closeOnMobile();
    };

    const beginRename = (c: ConversationSummary) => {
        setMenuFor(null);
        setRenaming(c.id);
        setRenameValue(c.title);
    };

    const cancelRename = () => {
        setRenaming(null);
        setRenameValue("");
    };

    const commitRename = async (id: string) => {
        const title = renameValue.trim();
        cancelRename();
        if (!title || !userId) return;
        const previous = conversations.find((c) => c.id === id)?.title;
        updateConversation(id, { title });
        try {
            await renameConversation(userId, id, title);
        } catch (e) {
            console.error("Rename failed:", e);
            if (previous) updateConversation(id, { title: previous });
        }
    };

    const togglePin = async (c: ConversationSummary) => {
        setMenuFor(null);
        if (!userId) return;
        const next = !c.is_pinned;
        updateConversation(c.id, { is_pinned: next ? 1 : 0 });
        try {
            await pinConversation(userId, c.id, next);
        } catch (e) {
            console.error("Pin failed:", e);
            updateConversation(c.id, { is_pinned: next ? 0 : 1 });
        }
    };

    const handleArchive = async (c: ConversationSummary) => {
        setMenuFor(null);
        if (!userId) return;
        try {
            await archiveConversation(userId, c.id, true);
            removeConversation(c.id);
            if (activeChatId === c.id) startNewChat();
        } catch (e) {
            console.error("Archive failed:", e);
        }
    };

    const confirmDelete = async () => {
        if (!deleting || !userId) return;
        setBusy(true);
        try {
            await deleteConversation(userId, deleting.id);
            removeConversation(deleting.id);
            if (activeChatId === deleting.id) startNewChat();
            setDeleting(null);
        } catch (e) {
            console.error("Delete failed:", e);
        } finally {
            setBusy(false);
        }
    };

    const updateSettings = (patch: Partial<AppSettings>) => {
        setSettings((prev) => ({ ...prev, ...patch }));
    };

    if (!sidebarOpen) return null;

    const rowProps = {
        activeChatId,
        renaming,
        renameValue,
        setRenameValue,
        menuFor,
        setMenuFor,
        menuRef,
        renameRef,
        onOpen: openConversation,
        onBeginRename: beginRename,
        onCancelRename: cancelRename,
        onCommitRename: commitRename,
        onTogglePin: togglePin,
        onArchive: handleArchive,
        onDeleteRequest: setDeleting,
    };

    const nav: {
        id: "chat";
        label: string;
        icon: React.ReactNode;
    }[] = [
            {
                id: "chat",
                label: "Chat",
                icon: <MessageSquare className="w-[15px] h-[15px]" />,
            },
        ];

    // ── Width ──
    const width = collapsed ? 60 : 260;

    return (
        <>
            {/* Mobile backdrop */}
            <div
                className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                onClick={toggleSidebar}
                aria-hidden="true"
            />

            <aside
                style={{ width }}
                className="fixed lg:relative inset-y-0 left-0 z-40 flex h-full shrink-0 flex-col border-r border-[var(--ryta-border)] bg-[var(--ryta-bg)] transition-[width] duration-200 ease-out overflow-hidden"
            >
                {/* ── Brand row ── */}
                <div className="flex h-12 shrink-0 items-center justify-between px-3">
                    {!collapsed ? (
                        <>
                            <div className="flex min-w-0 items-center gap-2">
                                <img
                                    src="/logo.png"
                                    alt=""
                                    className="h-6 w-6 rounded-md object-contain"
                                />
                                <span className="truncate font-serif text-[15px] font-semibold tracking-tight text-[var(--ryta-text)]">
                                    RyTa.AI
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={toggleCollapsed}
                                title="Collapse sidebar"
                                aria-label="Collapse sidebar"
                                className="p-1.5 rounded-md text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)] transition-colors"
                            >
                                <PanelLeftClose className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                            className="mx-auto p-1.5 rounded-md text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)] transition-colors"
                        >
                            <PanelLeftOpen className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* ── New chat ── */}
                <div className="px-2 pb-1">
                    <button
                        type="button"
                        onClick={handleNewChat}
                        title="New chat"
                        className={`flex h-9 items-center gap-2 rounded-lg text-[13px] font-medium text-[var(--ryta-text)] transition-colors hover:bg-[var(--ryta-surface)] ${collapsed
                                ? "w-9 mx-auto justify-center"
                                : "w-full px-2.5"
                            }`}
                    >
                        <Plus className="w-4 h-4 text-[var(--ryta-text-muted)] shrink-0" />
                        {!collapsed && <span>New chat</span>}
                    </button>
                </div>

                {/* ── Nav ── */}
                <nav className="px-1.5 pb-1">
                    {nav.map((item) => {
                        const active = view === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setView(item.id);
                                    closeOnMobile();
                                }}
                                title={collapsed ? item.label : undefined}
                                aria-current={active ? "page" : undefined}
                                className={`flex items-center gap-2.5 rounded-lg text-[13px] transition-colors ${collapsed
                                        ? "w-9 mx-auto justify-center py-2"
                                        : "w-full px-2.5 py-2"
                                    } ${active
                                        ? "bg-[var(--ryta-surface)] font-medium text-[var(--ryta-text)]"
                                        : "text-[var(--ryta-text-muted)] hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                                    }`}
                            >
                                <span className="shrink-0">{item.icon}</span>
                                {!collapsed && (
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* ── Search (expanded only) ── */}
                {!collapsed && (
                    <div className="px-2.5 py-2">
                        <div className="relative">
                            <Search
                                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ryta-text-subtle)]"
                                aria-hidden="true"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                placeholder="Search chats"
                                aria-label="Search chats"
                                className="h-8 w-full rounded-lg border border-transparent bg-transparent pl-8 pr-7 text-[12.5px] text-[var(--ryta-text)] outline-none transition-colors placeholder-[var(--ryta-text-subtle)] hover:border-[var(--ryta-border)] focus:border-[var(--ryta-border-strong)] focus:bg-[var(--ryta-surface)]"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                    aria-label="Clear search"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)]"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="mx-2.5 h-px shrink-0 bg-[var(--ryta-border)]" />

                {/* ── Threads (expanded only) ── */}
                {!collapsed && (
                    <div className="ryta-scroll flex-1 overflow-y-auto px-1.5 py-2">
                        {loading && conversations.length === 0 ? (
                            <p className="px-2.5 py-6 text-center text-[11px] text-[var(--ryta-text-subtle)]">
                                Loading…
                            </p>
                        ) : total === 0 ? (
                            <p className="px-2.5 py-6 text-center text-[11px] leading-relaxed text-[var(--ryta-text-subtle)]">
                                {searchQuery
                                    ? "Nothing matches that."
                                    : "No conversations yet."}
                            </p>
                        ) : (
                            <>
                                {pinned.length > 0 && (
                                    <ChatGroup
                                        label="Pinned"
                                        chats={pinned}
                                        isPinned
                                        {...rowProps}
                                    />
                                )}
                                {GROUP_ORDER.map((label) =>
                                    groups[label].length > 0 ? (
                                        <ChatGroup
                                            key={label}
                                            label={label}
                                            chats={groups[label]}
                                            {...rowProps}
                                        />
                                    ) : null
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Spacer for collapsed mode */}
                {collapsed && <div className="flex-1" />}

                {/* ── Bottom bar: theme + settings + account ── */}
                <div className="shrink-0 border-t border-[var(--ryta-border)] p-2">
                    {/* Theme + Settings */}
                    <div
                        className={`flex items-center ${collapsed ? "flex-col gap-1" : "gap-1"
                            }`}
                    >
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={
                                isDark
                                    ? "Switch to light"
                                    : "Switch to dark"
                            }
                            aria-label={
                                isDark
                                    ? "Switch to light"
                                    : "Switch to dark"
                            }
                            className={`p-2 rounded-md text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)] transition-colors ${collapsed
                                    ? "w-9 justify-center"
                                    : "flex-1 justify-center"
                                }`}
                        >
                            {isDark ? (
                                <Sun className="w-4 h-4" />
                            ) : (
                                <Moon className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setSettingsOpen(true)}
                            title="Settings"
                            aria-label="Settings"
                            className={`p-2 rounded-md text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)] transition-colors ${collapsed
                                    ? "w-9 justify-center"
                                    : "flex-1 justify-center"
                                }`}
                        >
                            <SettingsIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Account */}
                    <div
                        className={`mt-2 flex items-center ${collapsed ? "justify-center" : "gap-2.5"
                            }`}
                    >
                        <UserButton />
                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[12.5px] font-medium text-[var(--ryta-text)]">
                                    {user?.fullName || "You"}
                                </p>
                                <p className="truncate text-[10.5px] text-[var(--ryta-text-subtle)]">
                                    {user?.primaryEmailAddress?.emailAddress ??
                                        ""}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* ── Settings modal ── */}
            {settingsOpen && (
                <Settings
                    settings={settings}
                    persona={useChatStore.getState().persona}
                    onUpdateSettings={updateSettings}
                    onPersonaChange={(p) => {
                        const store = useChatStore.getState();
                        store.setPersona(p);
                        store.switchPersona(p);
                        setThemeName(PERSONA_THEME[p]);
                    }}
                    onClose={() => setSettingsOpen(false)}
                />
            )}

            {/* ── Confirm delete ── */}
            {deleting && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-title"
                >
                    <div className="w-full max-w-sm rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] p-5">
                        <h2
                            id="delete-title"
                            className="font-serif text-base font-semibold text-[var(--ryta-text)]"
                        >
                            Let it go?
                        </h2>
                        <p className="mt-2 text-[13px] leading-relaxed text-[var(--ryta-text-muted)]">
                            &ldquo;{deleting.title}&rdquo; and everything in
                            it will be gone. There is no bringing it back.
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleting(null)}
                                disabled={busy}
                                className="rounded-lg border border-[var(--ryta-border)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ryta-text)] transition-colors hover:bg-[var(--ryta-surface)]"
                            >
                                Keep it
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={busy}
                                className="rounded-lg bg-[var(--ryta-primary)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ryta-primary-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
                            >
                                {busy ? "Going…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;

// ─────────────────────────────────────────────
// Thread group
// ─────────────────────────────────────────────

interface RowProps {
    activeChatId: string | null;
    renaming: string | null;
    renameValue: string;
    setRenameValue: (v: string) => void;
    menuFor: string | null;
    setMenuFor: (id: string | null) => void;
    menuRef: React.RefObject<HTMLDivElement | null>;
    renameRef: React.RefObject<HTMLInputElement | null>;
    onOpen: (c: ConversationSummary) => void;
    onBeginRename: (c: ConversationSummary) => void;
    onCancelRename: () => void;
    onCommitRename: (id: string) => void;
    onTogglePin: (c: ConversationSummary) => void;
    onArchive: (c: ConversationSummary) => void;
    onDeleteRequest: (c: ConversationSummary) => void;
}

const ChatGroup: React.FC<
    { label: string; chats: ConversationSummary[]; isPinned?: boolean } &
    RowProps
> = ({ label, chats, isPinned = false, ...row }) => (
    <div className="mb-3">
        <h3 className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ryta-text-subtle)]">
            {isPinned && (
                <span
                    className="mr-1 text-[var(--ryta-primary)]"
                    aria-hidden="true"
                >
                    ◆
                </span>
            )}
            {label}
        </h3>
        <ul className="space-y-px">
            {chats.map((c) => (
                <ChatRow key={c.id} conversation={c} {...row} />
            ))}
        </ul>
    </div>
);

const ChatRow: React.FC<
    { conversation: ConversationSummary } & RowProps
> = ({
    conversation,
    activeChatId,
    renaming,
    renameValue,
    setRenameValue,
    menuFor,
    setMenuFor,
    menuRef,
    renameRef,
    onOpen,
    onBeginRename,
    onCancelRename,
    onCommitRename,
    onTogglePin,
    onArchive,
    onDeleteRequest,
}) => {
        const isActive = conversation.id === activeChatId;
        const isRenaming = conversation.id === renaming;
        const isMenuOpen = conversation.id === menuFor;

        return (
            <li className="group relative">
                {isRenaming ? (
                    <input
                        ref={renameRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => void onCommitRename(conversation.id)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                void onCommitRename(conversation.id);
                            }
                            if (e.key === "Escape") {
                                e.preventDefault();
                                onCancelRename();
                            }
                        }}
                        aria-label="Rename conversation"
                        className="w-full rounded-md border border-[var(--ryta-border-strong)] bg-[var(--ryta-surface-raised)] px-2 py-1.5 text-[12.5px] text-[var(--ryta-text)] outline-none"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => onOpen(conversation)}
                        aria-current={isActive ? "true" : undefined}
                        className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors ${isActive
                                ? "bg-[var(--ryta-surface)] font-medium text-[var(--ryta-text)]"
                                : "text-[var(--ryta-text-muted)] hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                            }`}
                    >
                        <span className="truncate">{conversation.title}</span>
                    </button>
                )}

                {!isRenaming && (
                    <div
                        className={`absolute right-1 top-1/2 -translate-y-1/2 transition-opacity ${isMenuOpen
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                            }`}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setMenuFor(isMenuOpen ? null : conversation.id)
                            }
                            title="More"
                            aria-label={`Options for ${conversation.title}`}
                            aria-expanded={isMenuOpen}
                            className="rounded-md p-1 text-[var(--ryta-text-subtle)] transition-colors hover:bg-[var(--ryta-surface-raised)] hover:text-[var(--ryta-text)]"
                        >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {isMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] p-1"
                            >
                                <MenuItem
                                    icon={<Pencil className="w-3.5 h-3.5" />}
                                    label="Rename"
                                    onClick={() =>
                                        onBeginRename(conversation)
                                    }
                                />
                                <MenuItem
                                    icon={
                                        conversation.is_pinned ? (
                                            <PinOff className="w-3.5 h-3.5" />
                                        ) : (
                                            <Pin className="w-3.5 h-3.5" />
                                        )
                                    }
                                    label={
                                        conversation.is_pinned ? "Unpin" : "Pin"
                                    }
                                    onClick={() => onTogglePin(conversation)}
                                />
                                <MenuItem
                                    icon={<Archive className="w-3.5 h-3.5" />}
                                    label="Archive"
                                    onClick={() => onArchive(conversation)}
                                />
                                <div className="my-1 h-px bg-[var(--ryta-border)]" />
                                <MenuItem
                                    icon={<Trash2 className="w-3.5 h-3.5" />}
                                    label="Delete"
                                    danger
                                    onClick={() =>
                                        onDeleteRequest(conversation)
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}
            </li>
        );
    };

const MenuItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
}> = ({ icon, label, onClick, danger = false }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors ${danger
                ? "text-[var(--ryta-primary)] hover:bg-[var(--ryta-surface)]"
                : "text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)]"
            }`}
    >
        {icon}
        {label}
    </button>
);