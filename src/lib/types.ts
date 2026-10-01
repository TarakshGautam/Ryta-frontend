// ─────────────────────────────────────────────────────────────
// RyTa.AI — Core Types
// Single source of truth for themes & personas.
// ─────────────────────────────────────────────────────────────

// ─── Appearance ───
export type Appearance = "system" | "light" | "dark";
export type ResolvedAppearance = "light" | "dark";

// ─── Themes ───
// Each persona owns a palette. Only two themes exist.
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
export interface AppSettings {
    appearance: Appearance;
    persona: Persona;
}

export const DEFAULT_SETTINGS: AppSettings = {
    appearance: "light",
    persona: "ryku",
};