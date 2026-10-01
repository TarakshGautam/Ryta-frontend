import { useState } from "react";
import {
    X,
    Monitor,
    Moon,
    Sun,
    Sliders,
    MessageSquare,
    User,
    Brain,
    Shield,
    Keyboard,
    Download,
    Trash2,
    AlertTriangle,
    Check,
    Palette,
} from "lucide-react";
import type {
    AppSettings,
    Appearance,
    ThemeName,
    Persona,
} from "../lib/types";


// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface SettingsProps {
    settings: AppSettings;
    persona: Persona;
    onUpdateSettings: (patch: Partial<AppSettings>) => void;
    onPersonaChange: (p: Persona) => void;
    onClose: () => void;
    onExportData: () => void;
    onClearHistory: () => void;
    initialTab?: Tab;
}

type Tab =
    | "general"
    | "appearance"
    | "chat"
    | "personalization"
    | "memory"
    | "privacy"
    | "shortcuts";

const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: Sliders },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "personalization", label: "Personalization", icon: User },
    { id: "memory", label: "Memory", icon: Brain },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
];

const THEMES: { id: ThemeName; label: string }[] = [
    { id: "sweetheart", label: "Sweetheart" },
    { id: "savage", label: "Savage" },
    { id: "calm", label: "Calm" },
    { id: "protector", label: "Protector" },
    { id: "auraman", label: "Auraman" },
    { id: "mentor", label: "Mentor" },
];

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
export default function Settings({
    settings,
    persona,
    onUpdateSettings,
    onPersonaChange,
    onClose,
    onExportData,
    onClearHistory,
    initialTab = "general",
}: SettingsProps) {
    const [tab, setTab] = useState<Tab>(initialTab);
    const [clearConfirm, setClearConfirm] = useState(false);

    const s = settings;
    const set = (patch: Partial<AppSettings>) => onUpdateSettings(patch);

    return (
        <div
            className="ryta-modal-fade fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
        >
            <div
                className="flex w-full max-w-[720px] overflow-hidden rounded-2xl border border-[var(--ryta-border-strong)] bg-[var(--ryta-bg)]"
                style={{
                    maxHeight: "88vh",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
                }}
            >
                {/* ── Left nav ── */}
                <nav className="flex w-[196px] shrink-0 flex-col border-r border-[var(--ryta-border)] bg-[var(--ryta-surface)] p-2">
                    <div className="px-2 pb-4 pt-1 font-serif text-[14px] font-semibold text-[var(--ryta-text)]">
                        Settings
                    </div>
                    {NAV.map((n) => {
                        const active = tab === n.id;
                        return (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => setTab(n.id)}
                                className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${active
                                        ? "border border-[var(--ryta-border)] bg-[var(--ryta-surface-raised)] font-medium text-[var(--ryta-text)]"
                                        : "border border-transparent text-[var(--ryta-text-muted)] hover:bg-[var(--ryta-surface-raised)] hover:text-[var(--ryta-text)]"
                                    }`}
                            >
                                <n.icon
                                    size={14}
                                    style={{
                                        opacity: active ? 1 : 0.65,
                                    }}
                                />
                                {n.label}
                            </button>
                        );
                    })}
                </nav>

                {/* ── Right content ── */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-[var(--ryta-border)] px-5 py-4">
                        <h2 className="m-0 font-serif text-[15px] font-semibold text-[var(--ryta-text)]">
                            {NAV.find((n) => n.id === tab)?.label}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close settings"
                            className="flex rounded-md p-1 text-[var(--ryta-text-muted)] transition-colors hover:bg-[var(--ryta-surface)] hover:text-[var(--ryta-text)]"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Tab content */}
                    <div className="ryta-scroll flex-1 overflow-y-auto p-5">
                        {tab === "general" && (
                            <Section>
                                <Row
                                    label="Persona"
                                    desc="Who you're talking to right now"
                                >
                                    <SegmentedControl
                                        value={persona}
                                        options={[
                                            {
                                                value: "ryku",
                                                label: "Ryku",
                                            },
                                            {
                                                value: "takshu",
                                                label: "Takshu",
                                            },
                                        ]}
                                        onChange={(v) =>
                                            onPersonaChange(v as Persona)
                                        }
                                    />
                                </Row>
                                <Row
                                    label="Appearance"
                                    desc="Light, dark, or follow system preference"
                                >
                                    <SegmentedControl
                                        value={s.appearance}
                                        options={[
                                            {
                                                value: "system",
                                                label: "System",
                                                icon: Monitor,
                                            },
                                            {
                                                value: "light",
                                                label: "Light",
                                                icon: Sun,
                                            },
                                            {
                                                value: "dark",
                                                label: "Dark",
                                                icon: Moon,
                                            },
                                        ]}
                                        onChange={(v) =>
                                            set({
                                                appearance:
                                                    v as Appearance,
                                            })
                                        }
                                    />
                                </Row>
                            </Section>
                        )}

                        {tab === "appearance" && (
                            <Section>
                                <Row
                                    label="Appearance"
                                    desc="Light, dark, or follow system preference"
                                >
                                    <SegmentedControl
                                        value={s.appearance}
                                        options={[
                                            {
                                                value: "system",
                                                label: "System",
                                                icon: Monitor,
                                            },
                                            {
                                                value: "light",
                                                label: "Light",
                                                icon: Sun,
                                            },
                                            {
                                                value: "dark",
                                                label: "Dark",
                                                icon: Moon,
                                            },
                                        ]}
                                        onChange={(v) =>
                                            set({
                                                appearance:
                                                    v as Appearance,
                                            })
                                        }
                                    />
                                </Row>
                                <Divider />
                                <div>
                                    <div className="mb-3 text-[13.5px] font-medium text-[var(--ryta-text)]">
                                        Theme
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {THEMES.map((t) => {
                                            const active =
                                                s.themeName === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() =>
                                                        set({
                                                            themeName:
                                                                t.id,
                                                        })
                                                    }
                                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[12.5px] transition-colors ${active
                                                            ? "border-[var(--ryta-primary)] bg-[var(--ryta-surface-raised)] text-[var(--ryta-primary)]"
                                                            : "border-[var(--ryta-border)] text-[var(--ryta-text-muted)] hover:border-[var(--ryta-border-strong)] hover:text-[var(--ryta-text)]"
                                                        }`}
                                                >
                                                    <span>{t.label}</span>
                                                    {active && (
                                                        <Check
                                                            size={12}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Section>
                        )}

                        {tab === "chat" && (
                            <Section>
                                <Row
                                    label="Enter to send"
                                    desc="Press Enter to send. Use Shift+Enter for new lines."
                                >
                                    <Toggle
                                        value={s.enterToSend}
                                        onChange={(v) =>
                                            set({ enterToSend: v })
                                        }
                                    />
                                </Row>
                                <Row
                                    label="Show timestamps"
                                    desc="Display time next to each message"
                                >
                                    <Toggle
                                        value={s.showTimestamps}
                                        onChange={(v) =>
                                            set({ showTimestamps: v })
                                        }
                                    />
                                </Row>
                                <Row
                                    label="Show message actions"
                                    desc="Show copy, feedback, and regenerate on hover"
                                >
                                    <Toggle
                                        value={s.showMessageActions}
                                        onChange={(v) =>
                                            set({
                                                showMessageActions: v,
                                            })
                                        }
                                    />
                                </Row>
                                <Row
                                    label="Auto-scroll"
                                    desc="Automatically scroll to new messages"
                                >
                                    <Toggle
                                        value={s.autoScroll}
                                        onChange={(v) =>
                                            set({ autoScroll: v })
                                        }
                                    />
                                </Row>
                                <Row
                                    label="Markdown rendering"
                                    desc="Render bold, code, lists, and formatting"
                                >
                                    <Toggle
                                        value={s.markdownRendering}
                                        onChange={(v) =>
                                            set({
                                                markdownRendering: v,
                                            })
                                        }
                                    />
                                </Row>
                                <Row
                                    label="Show AI status"
                                    desc="Show when the AI is thinking or generating"
                                >
                                    <Toggle
                                        value={s.showAiStatus}
                                        onChange={(v) =>
                                            set({ showAiStatus: v })
                                        }
                                    />
                                </Row>
                            </Section>
                        )}

                        {tab === "personalization" && (
                            <Section>
                                <div className="mb-4">
                                    <label className="mb-1 block text-[13.5px] font-medium text-[var(--ryta-text)]">
                                        Custom instructions
                                    </label>
                                    <p className="mb-2.5 text-[12.5px] leading-relaxed text-[var(--ryta-text-muted)]">
                                        Tell RyTa anything you'd like it
                                        to always keep in mind —
                                        preferences, context, or how you
                                        like to communicate.
                                    </p>
                                    <textarea
                                        value={s.customInstructions}
                                        onChange={(e) =>
                                            set({
                                                customInstructions:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="E.g. I prefer concise responses. I'm a software engineer. Always give examples when explaining concepts..."
                                        rows={5}
                                        className="w-full resize-y rounded-lg border border-[var(--ryta-border)] bg-[var(--ryta-surface)] p-3 text-[13.5px] leading-relaxed text-[var(--ryta-text)] outline-none transition-colors placeholder-[var(--ryta-text-subtle)] focus:border-[var(--ryta-border-strong)]"
                                    />
                                </div>
                                <Row
                                    label="Use conversation context"
                                    desc="Let RyTa refer back to earlier parts of your conversation"
                                >
                                    <Toggle
                                        value={s.useConversationContext}
                                        onChange={(v) =>
                                            set({
                                                useConversationContext:
                                                    v,
                                            })
                                        }
                                    />
                                </Row>
                            </Section>
                        )}

                        {tab === "memory" && (
                            <Section>
                                <Row
                                    label="Memory"
                                    desc="RyTa remembers things across conversations"
                                >
                                    <Toggle
                                        value={s.memory}
                                        onChange={(v) =>
                                            set({ memory: v })
                                        }
                                    />
                                </Row>
                                <Divider />
                                <div className="rounded-lg border border-[var(--ryta-border)] bg-[var(--ryta-surface)] p-4 text-center">
                                    <div className="text-[12.5px] text-[var(--ryta-text-subtle)]">
                                        No saved memories yet.
                                    </div>
                                </div>
                            </Section>
                        )}

                        {tab === "privacy" && (
                            <Section>
                                <Row
                                    label="Temporary chat"
                                    desc="Conversations in temporary mode are not saved"
                                >
                                    <Toggle
                                        value={s.temporaryChat}
                                        onChange={(v) =>
                                            set({ temporaryChat: v })
                                        }
                                    />
                                </Row>
                                <Row
                                    label="Save chat history"
                                    desc="Keep a record of past conversations"
                                >
                                    <Toggle
                                        value={s.chatHistory}
                                        onChange={(v) =>
                                            set({ chatHistory: v })
                                        }
                                    />
                                </Row>
                                <Divider />
                                <div className="flex flex-col gap-2">
                                    <DestructiveAction
                                        icon={Download}
                                        label="Export my data"
                                        desc="Download a copy of your conversations and settings"
                                        onClick={onExportData}
                                        buttonLabel="Export"
                                    />
                                    <DestructiveAction
                                        icon={Trash2}
                                        label="Clear conversation history"
                                        desc="Permanently delete all saved conversations"
                                        onClick={() => {
                                            if (clearConfirm) {
                                                onClearHistory();
                                                setClearConfirm(false);
                                            } else {
                                                setClearConfirm(true);
                                            }
                                        }}
                                        buttonLabel={
                                            clearConfirm
                                                ? "Confirm delete"
                                                : "Clear history"
                                        }
                                        danger={clearConfirm}
                                    />
                                </div>
                                {clearConfirm && (
                                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-[12.5px] text-[var(--ryta-text-muted)]">
                                        <AlertTriangle
                                            size={13}
                                            className="shrink-0 text-rose-500"
                                        />
                                        This action is permanent and
                                        cannot be undone.
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setClearConfirm(false)
                                            }
                                            className="ml-auto border-none bg-transparent text-[12px] text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)]"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </Section>
                        )}

                        {tab === "shortcuts" && (
                            <Section>
                                <SectionTitle>Navigation</SectionTitle>
                                <div className="mb-5 flex flex-col">
                                    {[
                                        {
                                            action: "New chat",
                                            keys: ["⌘", "K"],
                                        },
                                        {
                                            action: "Toggle sidebar",
                                            keys: ["⌘", "B"],
                                        },
                                        {
                                            action: "Focus composer",
                                            keys: ["/"],
                                        },
                                    ].map((s) => (
                                        <ShortcutRow
                                            key={s.action}
                                            action={s.action}
                                            keys={s.keys}
                                        />
                                    ))}
                                </div>
                                <SectionTitle>Conversation</SectionTitle>
                                <div className="flex flex-col">
                                    {[
                                        {
                                            action: "Send message",
                                            keys: ["↵"],
                                        },
                                        {
                                            action: "New line",
                                            keys: ["⇧", "↵"],
                                        },
                                        {
                                            action: "Stop generation",
                                            keys: ["Esc"],
                                        },
                                    ].map((s) => (
                                        <ShortcutRow
                                            key={s.action}
                                            action={s.action}
                                            keys={s.keys}
                                        />
                                    ))}
                                </div>
                            </Section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-2.5 mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ryta-text-subtle)]">
            {children}
        </div>
    );
}

function Divider() {
    return (
        <div className="my-4 h-px bg-[var(--ryta-border)]" />
    );
}

function Row({
    label,
    desc,
    children,
}: {
    label: string;
    desc?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--ryta-border)] py-3">
            <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-[var(--ryta-text)]">
                    {label}
                </div>
                {desc && (
                    <div className="mt-0.5 text-[12px] leading-relaxed text-[var(--ryta-text-muted)]">
                        {desc}
                    </div>
                )}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function Toggle({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={() => onChange(!value)}
            className="relative h-[22px] w-10 rounded-full border transition-colors"
            style={{
                background: value
                    ? "var(--ryta-primary)"
                    : "var(--ryta-surface-raised)",
                borderColor: value
                    ? "var(--ryta-primary)"
                    : "var(--ryta-border-strong)",
            }}
        >
            <span
                className="absolute top-[2px] h-4 w-4 rounded-full transition-all"
                style={{
                    left: value ? 20 : 2,
                    background: value
                        ? "var(--ryta-primary-fg)"
                        : "var(--ryta-text-muted)",
                }}
            />
        </button>
    );
}

function SegmentedControl({
    value,
    options,
    onChange,
}: {
    value: string;
    options: {
        value: string;
        label: string;
        icon?: React.ElementType;
    }[];
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex gap-0.5 rounded-lg border border-[var(--ryta-border)] bg-[var(--ryta-surface)] p-[3px]">
            {options.map((opt) => {
                const active = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] transition-colors ${active
                                ? "bg-[var(--ryta-surface-raised)] font-medium text-[var(--ryta-text)]"
                                : "text-[var(--ryta-text-muted)] hover:text-[var(--ryta-text)]"
                            }`}
                    >
                        {opt.icon && <opt.icon size={12} />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

function DestructiveAction({
    icon: Icon,
    label,
    desc,
    onClick,
    buttonLabel,
    danger,
}: {
    icon: React.ElementType;
    label: string;
    desc: string;
    onClick: () => void;
    buttonLabel: string;
    danger?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--ryta-border)] bg-[var(--ryta-surface)] px-3.5 py-3">
            <div className="flex items-center gap-2.5">
                <Icon
                    size={15}
                    className="shrink-0 text-[var(--ryta-text-muted)]"
                />
                <div>
                    <div className="text-[13.5px] font-medium text-[var(--ryta-text)]">
                        {label}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[var(--ryta-text-muted)]">
                        {desc}
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={onClick}
                className={`shrink-0 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${danger
                        ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        : "border border-[var(--ryta-border)] text-[var(--ryta-text-muted)] hover:bg-[var(--ryta-surface-raised)] hover:text-[var(--ryta-text)]"
                    }`}
            >
                {buttonLabel}
            </button>
        </div>
    );
}

function ShortcutRow({
    action,
    keys,
}: {
    action: string;
    keys: string[];
}) {
    return (
        <div className="flex items-center justify-between border-b border-[var(--ryta-border)] py-2.5">
            <span className="text-[13.5px] text-[var(--ryta-text-muted)]">
                {action}
            </span>
            <div className="flex gap-1">
                {keys.map((k, i) => (
                    <kbd
                        key={i}
                        className="rounded-md border border-[var(--ryta-border-strong)] bg-[var(--ryta-surface-raised)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--ryta-text-muted)]"
                    >
                        {k}
                    </kbd>
                ))}
            </div>
        </div>
    );
}