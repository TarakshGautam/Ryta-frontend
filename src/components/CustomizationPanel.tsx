import {
    useCustomization,
} from "@/context/CustomizationContext";
import {
    ACCENT_PALETTES,
    FONT_STACKS,
} from "@/lib/customization";
import type { AccentColor, FontFamily, RadiusPreset } from "@/lib/types";
import { Check } from "lucide-react";

const ACCENT_ORDER: AccentColor[] = [
    "rose",
    "pink",
    "purple",
    "blue",
    "teal",
    "emerald",
    "amber",
    "orange",
    "red",
    "slate",
];

const FONT_ORDER: { id: FontFamily; label: string }[] = [
    { id: "quicksand", label: "Quicksand" },
    { id: "inter", label: "Inter" },
    { id: "geist", label: "Geist" },
    { id: "system", label: "System" },
    { id: "serif", label: "Serif" },
];

const RADIUS_ORDER: { id: RadiusPreset; label: string }[] = [
    { id: "sharp", label: "Sharp" },
    { id: "default", label: "Default" },
    { id: "round", label: "Round" },
];

const CustomizationPanel: React.FC = () => {
    const {
        customization,
        setAccent,
        setFont,
        setFontScale,
        setRadius,
        reset,
    } = useCustomization();

    return (
        <div className="space-y-6">
            {/* ─── Accent Color ─── */}
            <section>
                <h3 className="mb-3 text-[13px] font-semibold text-[var(--ryta-text)]">
                    Accent color
                </h3>
                <div className="grid grid-cols-5 gap-2">
                    {ACCENT_ORDER.map((accent) => {
                        const palette = ACCENT_PALETTES[accent];
                        if (!palette) return null;
                        const active = customization.accent === accent;
                        return (
                            <button
                                key={accent}
                                type="button"
                                onClick={() => setAccent(accent)}
                                title={accent}
                                aria-label={`Accent ${accent}`}
                                className={[
                                    "relative aspect-square rounded-xl transition-all duration-150",
                                    active
                                        ? "ring-2 ring-offset-2 ring-offset-[var(--ryta-bg)] scale-105"
                                        : "hover:scale-105",
                                ].join(" ")}
                                style={{
                                    backgroundColor: palette.primary,
                                }}
                            >
                                {active && (
                                    <Check
                                        className="absolute inset-0 m-auto h-4 w-4"
                                        style={{ color: palette.primaryFg }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ─── Font Family ─── */}
            <section>
                <h3 className="mb-3 text-[13px] font-semibold text-[var(--ryta-text)]">
                    Font
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {FONT_ORDER.map((f) => {
                        const active = customization.fontFamily === f.id;
                        return (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setFont(f.id)}
                                style={{ fontFamily: FONT_STACKS[f.id] }}
                                className={[
                                    "rounded-xl border px-3 py-2 text-left text-[13px] transition-all duration-150",
                                    active
                                        ? "border-[var(--ryta-primary)] bg-[var(--ryta-primary)]/10 text-[var(--ryta-text)]"
                                        : "border-[var(--ryta-border)] text-[var(--ryta-text-muted)] hover:border-[var(--ryta-border-strong)] hover:text-[var(--ryta-text)]",
                                ].join(" ")}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ─── Font Size ─── */}
            <section>
                <h3 className="mb-3 text-[13px] font-semibold text-[var(--ryta-text)]">
                    Text size · {Math.round(customization.fontScale * 100)}%
                </h3>
                <input
                    type="range"
                    min="0.85"
                    max="1.15"
                    step="0.05"
                    value={customization.fontScale}
                    onChange={(e) =>
                        setFontScale(parseFloat(e.target.value))
                    }
                    className="w-full accent-[var(--ryta-primary)]"
                />
                <div className="mt-1 flex justify-between text-[10px] text-[var(--ryta-text-subtle)]">
                    <span>Small</span>
                    <span>Default</span>
                    <span>Large</span>
                </div>
            </section>

            {/* ─── Corner Radius ─── */}
            <section>
                <h3 className="mb-3 text-[13px] font-semibold text-[var(--ryta-text)]">
                    Corners
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {RADIUS_ORDER.map((r) => {
                        const active = customization.radius === r.id;
                        return (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRadius(r.id)}
                                className={[
                                    "rounded-xl border px-3 py-2 text-[13px] transition-all duration-150",
                                    active
                                        ? "border-[var(--ryta-primary)] bg-[var(--ryta-primary)]/10 text-[var(--ryta-text)]"
                                        : "border-[var(--ryta-border)] text-[var(--ryta-text-muted)] hover:border-[var(--ryta-border-strong)] hover:text-[var(--ryta-text)]",
                                ].join(" ")}
                            >
                                {r.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ─── Reset ─── */}
            <button
                type="button"
                onClick={reset}
                className="w-full rounded-xl border border-[var(--ryta-border)] py-2 text-[12.5px] text-[var(--ryta-text-muted)] transition-colors hover:border-[var(--ryta-border-strong)] hover:text-[var(--ryta-text)]"
            >
                Reset to defaults
            </button>
        </div>
    );
};

export default CustomizationPanel;