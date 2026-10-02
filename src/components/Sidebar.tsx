import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    Archive,
    Download,
    LogOut,
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
    Sun,
    Trash2,
    User,
    X,
} from "lucide-react";
import { UserButton, useUser, useClerk } from "@clerk/clerk-react";
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

const GROUP_LABELS: Record<DateGroup, string> = {
    Today: "Today",
    Yesterday: "Yesterday",
    "Previous 7 days": "Previous 7 days",
    Older: "Older",
};

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
// PWA install hook — used inside this file
// ─────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function usePWAInstall() {
    const [deferred, setDeferred] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            Boolean(
                (navigator as unknown as { standalone?: boolean }).standalone
            );
        setInstalled(standalone);

        const onPrompt = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
        };
        const onInstalled = () => {
            setInstalled(true);
            setDeferred(null);
        };

        window.addEventListener("beforeinstallprompt", onPrompt);
        window.addEventListener("appinstalled", onInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", onPrompt);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        if (!deferred) return false;
        try {
            await deferred.prompt();
            const { outcome } = await deferred.userChoice;
            setDeferred(null);
            return outcome === "accepted";
        } catch (e) {
            console.warn("[PWA] install failed:", e);
            return false;
        }
    }, [deferred]);

    return {
        canInstall: Boolean(deferred) && !installed,
        installed,
        promptInstall,
    };
}

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const userId = user?.id;
    const navigate = useNavigate();
    const { setThemeName, resolvedAppearance, toggleTheme, setAppearance } =
        useTheme();
    const { canInstall, promptInstall } = usePWAInstall();

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
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

    const menuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const renameRef = useRef<HTMLInputElement>(null);

    const isDark = resolvedAppearance === "dark";

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

    useEffect(() => {
        if (!menuFor && !userMenuOpen) return;
        const onDown = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setMenuFor(null);
            }
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(e.target as Node)
            ) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [menuFor, userMenuOpen]);

    useEffect(() => {
        if (renaming) {
            renameRef.current?.focus();
            renameRef.current?.select();
        }
    }, [renaming]);

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
        if (patch.appearance) {
            setAppearance(patch.appearance);
        }
    };

    const handleInstallApp = async () => {
        setUserMenuOpen(false);
        const ok = await promptInstall();
        if (!ok) {
            // Fallback message (mostly for dev / unsupported browsers)
            alert(
                "App install is available from your browser menu (⋮ → Install app / Add to Home Screen)."
            );
        }
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

    const width = collapsed ? 0 : 260;
    const fullName = user?.fullName || user?.firstName || "You";

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
                {/* Top brand row */}
                <div className="flex h-14 shrink-0 items-center justify-between px-3">
                    {!collapsed ? (
                        <>
                            <div className="flex min-w-0 items-center gap-2.5">
                                <img
                                    src="/logo.png"
                                    alt=""
                                    className="h-7 w-7 rounded-lg object-contain"
                                />
                                <span className="truncate font-serif text-[17px] tracking-tight text-[var(--ryta-text)]">
                                    Ryta
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={toggleCollapsed}
                                title="Collapse sidebar"
                                aria-label="Collapse sidebar"
                                className="rounded-lg p-1.5 text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                            >
                                <PanelLeftClose className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                            className="mx-auto rounded-lg p-1.5 text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                        >
                            <PanelLeftOpen className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* New chat */}
                <div className={`shrink-0 ${collapsed ? "px-2" : "px-2.5"} pb-2`}>
                    <button
                        type="button"
                        onClick={handleNewChat}
                        title="New chat"
                        className={
                            collapsed
                                ? "flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-[var(--ryta-surface)] text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface-raised)] hover:text-[var(--ryta-text)]"
                                : "flex h-10 w-full items-center gap-2.5 rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-surface)] px-3 text-[13.5px] font-medium text-[var(--ryta-text)] transition-colors hover:bg-[var(--ryta-surface-raised)]"
                        }
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>New chat</span>}
                    </button>
                </div>

                {/* Search */}
                {!collapsed && (
                    <div className="shrink-0 px-2.5 pb-1">
                        <div className="relative">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ryta-text-subtle)]"
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
                                className="h-9 w-full rounded-xl border border-transparent bg-transparent pl-9 pr-8 text-[12.5px] text-[var(--ryta-text)] outline-none transition-colors placeholder-[var(--ryta-text-subtle)] hover:bg-[var(--ryta-surface)]/50 focus:bg-[var(--ryta-surface)]/50"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                    aria-label="Clear search"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[var(--ryta-text-subtle)] hover:text-[var(--ryta-text)]"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Thread list */}
                {!collapsed && (
                    <div className="ryta-scroll flex-1 overflow-y-auto px-2 py-2">
                        {loading && conversations.length === 0 ? (
                            <p className="px-3 py-6 text-center text-[11.5px] text-[var(--ryta-text-subtle)]">
                                Loading…
                            </p>
                        ) : total === 0 ? (
                            <p className="px-3 py-6 text-center text-[11.5px] leading-relaxed text-[var(--ryta-text-subtle)]">
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
                                            label={GROUP_LABELS[label]}
                                            chats={groups[label]}
                                            {...rowProps}
                                        />
                                    ) : null
                                )}
                            </>
                        )}
                    </div>
                )}

                {collapsed && <div className="flex-1" />}

                {/* Bottom user row */}
                <div
                    ref={userMenuRef}
                    className={`relative shrink-0 border-t border-[var(--ryta-border)] ${collapsed ? "p-2" : "p-2.5"}`}
                >
                    <button
                        type="button"
                        onClick={() => setUserMenuOpen((v) => !v)}
                        title={collapsed ? fullName : undefined}
                        aria-label="Account menu"
                        aria-expanded={userMenuOpen}
                        className={
                            collapsed
                                ? "flex w-full items-center justify-center rounded-xl p-1 transition-colors hover:bg-[var(--ryta-surface)]"
                                : "flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-[var(--ryta-surface)]"
                        }
                    >
                        <div className="shrink-0">
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-7 h-7",
                                        userButtonTrigger:
                                            "focus:shadow-none",
                                    },
                                }}
                            />
                        </div>
                        {!collapsed && (
                            <>
                                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--ryta-text)]">
                                    {fullName}
                                </span>
                                <MoreHorizontal className="h-4 w-4 shrink-0 text-[var(--ryta-text-subtle)]" />
                            </>
                        )}
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                        <div
                            className={`absolute z-50 rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] p-1 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] ${collapsed
                                    ? "bottom-full left-2 mb-1 w-52"
                                    : "bottom-full left-2 right-2 mb-1"
                                }`}
                        >
                            {canInstall && (
                                <AccountMenuRow
                                    icon={<Download className="h-3.5 w-3.5" />}
                                    label="Install app"
                                    onClick={handleInstallApp}
                                />
                            )}
                            <AccountMenuRow
                                icon={<User className="h-3.5 w-3.5" />}
                                label="Account"
                                onClick={() => {
                                    setUserMenuOpen(false);
                                    navigate("/user-profile");
                                }}
                            />
                            <AccountMenuRow
                                icon={<SettingsIcon className="h-3.5 w-3.5" />}
                                label="Settings"
                                onClick={() => {
                                    setSettingsOpen(true);
                                    setUserMenuOpen(false);
                                }}
                            />
                            <AccountMenuRow
                                icon={
                                    isDark ? (
                                        <Sun className="h-3.5 w-3.5" />
                                    ) : (
                                        <Moon className="h-3.5 w-3.5" />
                                    )
                                }
                                label={isDark ? "Light mode" : "Dark mode"}
                                onClick={() => {
                                    toggleTheme();
                                    setUserMenuOpen(false);
                                }}
                            />
                            <div className="my-1 h-px bg-[var(--ryta-border)]" />
                            <AccountMenuRow
                                icon={<LogOut className="h-3.5 w-3.5" />}
                                label="Log out"
                                danger
                                onClick={() => {
                                    setUserMenuOpen(false);
                                    void signOut();
                                }}
                            />
                        </div>
                    )}
                </div>
            </aside>

            {/* Settings modal */}
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

            {/* Confirm delete */}
            {deleting && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-title"
                >
                    <div className="w-full max-w-sm rounded-2xl border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]">
                        <h2
                            id="delete-title"
                            className="font-serif text-lg font-semibold text-[var(--ryta-text)]"
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
                                className="rounded-lg border border-[var(--ryta-border)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--ryta-text)] transition-colors hover:bg-[var(--ryta-surface)]"
                            >
                                Keep it
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={busy}
                                className="rounded-lg bg-[var(--ryta-primary)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--ryta-primary-fg)] shadow-[0_2px_12px_-4px_var(--ryta-glow)] transition-all hover:bg-[var(--ryta-primary-hover)] disabled:opacity-60"
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
// Chat group
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
        <h3 className="px-3 pb-1.5 pt-2 text-[11px] font-medium text-[var(--ryta-text-subtle)]">
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
        <ul className="space-y-0.5">
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
                        className="w-full rounded-lg border border-[var(--ryta-primary)]/50 bg-[var(--ryta-surface-raised)] px-2.5 py-2 text-[13px] text-[var(--ryta-text)] outline-none shadow-[0_0_0_3px_var(--ryta-glow)]"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => onOpen(conversation)}
                        aria-current={isActive ? "true" : undefined}
                        className={`flex w-full items-center rounded-lg px-2.5 py-2 pr-8 text-left text-[13px] transition-colors ${isActive
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
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {isMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] p-1 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]"
                            >
                                <AccountMenuRow
                                    icon={<Pencil className="h-3.5 w-3.5" />}
                                    label="Rename"
                                    onClick={() => onBeginRename(conversation)}
                                />
                                <AccountMenuRow
                                    icon={
                                        conversation.is_pinned ? (
                                            <PinOff className="h-3.5 w-3.5" />
                                        ) : (
                                            <Pin className="h-3.5 w-3.5" />
                                        )
                                    }
                                    label={
                                        conversation.is_pinned ? "Unpin" : "Pin"
                                    }
                                    onClick={() => onTogglePin(conversation)}
                                />
                                <AccountMenuRow
                                    icon={<Archive className="h-3.5 w-3.5" />}
                                    label="Archive"
                                    onClick={() => onArchive(conversation)}
                                />
                                <div className="my-1 h-px bg-[var(--ryta-border)]" />
                                <AccountMenuRow
                                    icon={<Trash2 className="h-3.5 w-3.5" />}
                                    label="Delete"
                                    danger
                                    onClick={() => onDeleteRequest(conversation)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </li>
        );
    };

// ─────────────────────────────────────────────
// Shared menu row
// ─────────────────────────────────────────────
const AccountMenuRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
}> = ({ icon, label, onClick, danger = false }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors ${danger
                ? "text-[var(--ryta-primary)] hover:bg-[var(--ryta-surface)]"
                : "text-[var(--ryta-text)] hover:bg-[var(--ryta-surface)]"
            }`}
    >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
);