export type RytaModel = "takshu" | "ryku";
export type RytaMode = "auraman" | "mentor" | "protector" | "sweetheart" | "calm" | "savage";
export type Appearance = "light" | "dark" | "system";

export interface ThemeTokens {
    bg: string;
    surface: string;
    border: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
    glow: string;
    headingFont: string;
}

type ThemeMap = Record<RytaModel, Record<string, { light: ThemeTokens; dark: ThemeTokens }>>;

export const THEME_PALETTES: ThemeMap = {
    takshu: {
        auraman: {
            dark: {
                bg: "#0F080A",
                surface: "#1C1014",
                border: "#331E24",
                primary: "#E56B8A",
                secondary: "#E89B88",
                accent: "#F4A261",
                text: "#FCEEEF",
                muted: "#A38087",
                glow: "rgba(229, 107, 138, 0.25)",
                headingFont: "var(--font-serif)",
            },
            light: {
                bg: "#FFF7F8",
                surface: "#FFFFFF",
                border: "#F3DBE0",
                primary: "#C94A6E",
                secondary: "#DB7B6E",
                accent: "#E07A5F",
                text: "#2B1419",
                muted: "#8C6B72",
                glow: "rgba(201, 74, 110, 0.12)",
                headingFont: "var(--font-serif)",
            },
        },
        mentor: {
            dark: {
                bg: "#0B0E14",
                surface: "#141A24",
                border: "#202A3B",
                primary: "#6366F1",
                secondary: "#818CF8",
                accent: "#06B6D4",
                text: "#EEF2FF",
                muted: "#7886A0",
                glow: "rgba(99, 102, 241, 0.22)",
                headingFont: "var(--font-tech)",
            },
            light: {
                bg: "#F8FAFC",
                surface: "#FFFFFF",
                border: "#E2E8F0",
                primary: "#4338CA",
                secondary: "#6366F1",
                accent: "#0284C7",
                text: "#0F172A",
                muted: "#64748B",
                glow: "rgba(67, 56, 202, 0.10)",
                headingFont: "var(--font-tech)",
            },
        },
        protector: {
            dark: {
                bg: "#0E0E0C",
                surface: "#181814",
                border: "#2D2D24",
                primary: "#F59E0B",
                secondary: "#EA580C",
                accent: "#EAB308",
                text: "#FEFCE8",
                muted: "#9CA3AF",
                glow: "rgba(245, 158, 11, 0.20)",
                headingFont: "var(--font-heading)",
            },
            light: {
                bg: "#FAF9F5",
                surface: "#FFFFFF",
                border: "#E7E5E4",
                primary: "#D97706",
                secondary: "#C2410C",
                accent: "#CA8A04",
                text: "#1C1917",
                muted: "#78716C",
                glow: "rgba(217, 119, 6, 0.10)",
                headingFont: "var(--font-heading)",
            },
        },
    },
    ryku: {
        sweetheart: {
            dark: {
                bg: "#12070B",
                surface: "#210D15",
                border: "#3D1827",
                primary: "#F43F5E",
                secondary: "#EC4899",
                accent: "#FB7185",
                text: "#FFF1F2",
                muted: "#B4788A",
                glow: "rgba(244, 63, 94, 0.28)",
                headingFont: "var(--font-heading)",
            },
            light: {
                bg: "#FFF5F7",
                surface: "#FFFFFF",
                border: "#FFE4E6",
                primary: "#E11D48",
                secondary: "#DB2777",
                accent: "#F43F5E",
                text: "#4C0519",
                muted: "#9F1239",
                glow: "rgba(225, 29, 72, 0.12)",
                headingFont: "var(--font-heading)",
            },
        },
        calm: {
            dark: {
                bg: "#061315",
                surface: "#0D2023",
                border: "#18383D",
                primary: "#2DD4BF",
                secondary: "#38BDF8",
                accent: "#A7F3D0",
                text: "#F0FDFA",
                muted: "#6B8E93",
                glow: "rgba(45, 212, 191, 0.15)",
                headingFont: "var(--font-body)",
            },
            light: {
                bg: "#F2F9F9",
                surface: "#FFFFFF",
                border: "#CCECE8",
                primary: "#0D9488",
                secondary: "#0284C7",
                accent: "#059669",
                text: "#042F2E",
                muted: "#5E817F",
                glow: "rgba(13, 148, 136, 0.08)",
                headingFont: "var(--font-body)",
            },
        },
        savage: {
            dark: {
                bg: "#0A0507",
                surface: "#170A0F",
                border: "#2E111C",
                primary: "#E11D48",
                secondary: "#9333EA",
                accent: "#F97316",
                text: "#FAFAFA",
                muted: "#8E727D",
                glow: "rgba(225, 29, 72, 0.35)",
                headingFont: "var(--font-heading)",
            },
            light: {
                bg: "#FAFAFA",
                surface: "#FFFFFF",
                border: "#E4E4E7",
                primary: "#BE123C",
                secondary: "#7E22CE",
                accent: "#EA580C",
                text: "#09090B",
                muted: "#71717A",
                glow: "rgba(190, 18, 60, 0.15)",
                headingFont: "var(--font-heading)",
            },
        },
    },
};