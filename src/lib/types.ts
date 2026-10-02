// ─────────────────────────────────────────────
// RyTa.AI — Core Types
// ─────────────────────────────────────────────

// ─── Appearance ───
export type Appearance = "system" | "light" | "dark";
export type ResolvedAppearance = "light" | "dark";

// ─── Themes (legacy) ───
export type ThemeName = "sweetheart" | "protector" | "neutral";

// ─── Persona ───
export type Persona = "ryku" | "takshu";

// ─── Persona → theme mapping ───
export const PERSONA_THEME: Record<Persona, ThemeName> = {
    ryku: "sweetheart",
    takshu: "protector",
};

// ─── Customization ───
export type AccentColor =
    | "rose"
    | "pink"
    | "purple"
    | "blue"
    | "teal"
    | "emerald"
    | "amber"
    | "orange"
    | "red"
    | "slate";

export type FontFamily =
    | "quicksand"
    | "inter"
    | "geist"
    | "system"
    | "serif";

export type RadiusPreset = "sharp" | "default" | "round";

export interface Customization {
    accent: AccentColor;
    fontFamily: FontFamily;
    fontScale: number;
    radius: RadiusPreset;
}

export const DEFAULT_CUSTOMIZATION: Customization = {
    accent: "slate",
    fontFamily: "system",
    fontScale: 1,
    radius: "default",
};

// ─── UI Preferences ───
export interface AppSettings {
    appearance: Appearance;
    persona: Persona;
    customization: Customization;
}

export const DEFAULT_SETTINGS: AppSettings = {
    appearance: "light",
    persona: "ryku",
    customization: DEFAULT_CUSTOMIZATION,
};