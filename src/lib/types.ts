// ─────────────────────────────────────────────────────────────
// RyTa.AI — Core Types
// Mirrors the live Cloudflare Worker contract.
// Two personas, two themes.
// ─────────────────────────────────────────────────────────────

// ─── Appearance ───
export type Appearance = "system" | "light" | "dark";
export type ResolvedAppearance = "light" | "dark";

// ─── Themes ───
// Each persona owns a palette. Only two themes exist now.
export type ThemeName = "sweetheart" | "protector";

// ─── Persona ───
export type Persona = "ryku" | "takshu";

// ─── Persona → palette mapping ───
// Switching souls retints the entire app.
export const PERSONA_THEME: Record<Persona, ThemeName> = {
    ryku: "sweetheart",
    takshu: "protector",
};

// ─── UI Preferences ───
// Only settings that are actually wired to behavior.
export interface AppSettings {
    // Appearance
    appearance: Appearance;

    // Persona
    persona: Persona;
}

export const DEFAULT_SETTINGS: AppSettings = {
    appearance: "light",
    persona: "ryku",
};