// ─────────────────────────────────────────────
// Customization presets — constants only
// (Kept out of the .tsx so React Fast Refresh
//  doesn't warn about mixed exports.)
// ─────────────────────────────────────────────
import type {
    AccentColor,
    FontFamily,
    RadiusPreset,
} from "@/lib/types";

// ─── Accent palettes ───
export interface AccentPalette {
    primary: string;
    primaryHover: string;
    primaryFg: string;
    glow: string;
}

export const ACCENT_PALETTES: Record<AccentColor, AccentPalette> = {
    rose: {
        primary: "#E11D48",
        primaryHover: "#BE123C",
        primaryFg: "#FFFFFF",
        glow: "rgba(225, 29, 72, 0.12)",
    },
    pink: {
        primary: "#DB2777",
        primaryHover: "#BE185D",
        primaryFg: "#FFFFFF",
        glow: "rgba(219, 39, 119, 0.12)",
    },
    purple: {
        primary: "#7C3AED",
        primaryHover: "#6D28D9",
        primaryFg: "#FFFFFF",
        glow: "rgba(124, 58, 237, 0.12)",
    },
    blue: {
        primary: "#2563EB",
        primaryHover: "#1D4ED8",
        primaryFg: "#FFFFFF",
        glow: "rgba(37, 99, 235, 0.12)",
    },
    teal: {
        primary: "#0D9488",
        primaryHover: "#0F766E",
        primaryFg: "#FFFFFF",
        glow: "rgba(13, 148, 136, 0.12)",
    },
    emerald: {
        primary: "#059669",
        primaryHover: "#047857",
        primaryFg: "#FFFFFF",
        glow: "rgba(5, 150, 105, 0.12)",
    },
    amber: {
        primary: "#D97706",
        primaryHover: "#B45309",
        primaryFg: "#FFFFFF",
        glow: "rgba(217, 119, 6, 0.10)",
    },
    orange: {
        primary: "#EA580C",
        primaryHover: "#C2410C",
        primaryFg: "#FFFFFF",
        glow: "rgba(234, 88, 12, 0.12)",
    },
    red: {
        primary: "#DC2626",
        primaryHover: "#B91C1C",
        primaryFg: "#FFFFFF",
        glow: "rgba(220, 38, 38, 0.12)",
    },
    slate: {
        primary: "#475569",
        primaryHover: "#334155",
        primaryFg: "#FFFFFF",
        glow: "rgba(71, 85, 105, 0.12)",
    },
};

// ─── Font stacks ───
export const FONT_STACKS: Record<FontFamily, string> = {
    quicksand: "'Quicksand', system-ui, sans-serif",
    inter: "'Inter', system-ui, sans-serif",
    geist: "'Geist Variable', system-ui, sans-serif",
    system: "system-ui, -apple-system, sans-serif",
    serif: "'Fraunces', Georgia, serif",
};

// ─── Radius presets ───
export interface RadiusValues {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
}

export const RADIUS_PRESETS: Record<RadiusPreset, RadiusValues> = {
    sharp: {
        sm: "2px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
        "3xl": "12px",
    },
    default: {
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        "2xl": "18px",
        "3xl": "22px",
    },
    round: {
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "22px",
        "2xl": "26px",
        "3xl": "30px",
    },
};