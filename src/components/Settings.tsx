import { useState } from "react";
import {
    X,
    Monitor,
    Moon,
    Sun,
    User,
    Palette,
    Check,
} from "lucide-react";
import type { AppSettings, Appearance, Persona } from "../lib/types";
import { PERSONA_THEME } from "../lib/types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface SettingsProps {
    settings: AppSettings;
    persona: Persona;
    onUpdateSettings: (patch: Partial<AppSettings>) => void;
    onPersonaChange: (p: Persona) => void;
    onClose: () => void;
}

type Tab = "general" | "appearance";

const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
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
}: SettingsProps) {
    const [tab, setTab] = useState<Tab>("general");

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
                className="flex w-full max-w-[560px] overflow-hidden rounded-2xl border border-[var(--ryta-border-strong)] bg-[var(--ryta-bg)]"
                style={{
                    maxHeight: "88vh",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
                }}
            >
                {/* ── Left nav ── */}
                <nav className="flex w-[160px] shrink-0 flex-col border-r border-[var(--ryta-border)] bg-[var(--ryta-surface)] p-2">
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
                                    style={{ opacity: active ? 1 : 0.65 }}
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
                                            { value: "ryku", label: "Ryku" },
                                            { value: "takshu", label: "Takshu" },
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
                                                appearance: v as Appearance,
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
                                                appearance: v as Appearance,
                                            })
                                        }
                                    />
                                </Row>
                                <Divider />
                                <div>
                                    <div className="mb-3 text-[13.5px] font-medium text-[var(--ryta-text)]">
                                        Theme
                                    </div>
                                    <p className="mb-3 text-[12px] leading-relaxed text-[var(--ryta-text-muted)]">
                                        Theme is tied to the active persona.
                                        Switch persona to change the palette.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(
                                            Object.entries(PERSONA_THEME) as [
                                                Persona,
                                                string,
                                            ][]
                                        ).map(([p, theme]) => {
                                            const active = persona === p;
                                            return (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() =>
                                                        onPersonaChange(p)
                                                    }
                                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[12.5px] transition-colors ${active
                                                            ? "border-[var(--ryta-primary)] bg-[var(--ryta-surface-raised)] text-[var(--ryta-primary)]"
                                                            : "border-[var(--ryta-border)] text-[var(--ryta-text-muted)] hover:border-[var(--ryta-border-strong)] hover:text-[var(--ryta-text)]"
                                                        }`}
                                                >
                                                    <span className="capitalize">
                                                        {theme}
                                                    </span>
                                                    {active && <Check size={12} />}
                                                </button>
                                            );
                                        })}
                                    </div>
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

function Divider() {
    return <div className="my-4 h-px bg-[var(--ryta-border)]" />;
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