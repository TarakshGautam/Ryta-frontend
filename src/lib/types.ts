// ─────────────────────────────────────────────────────────────
// RyTa.AI — Core Types
// Mirrors the live Cloudflare Worker contract.
// Two personas, six themes, no sub-modes.
// ─────────────────────────────────────────────────────────────

// ─── Appearance ───
export type Appearance = "system" | "light" | "dark";
export type ResolvedAppearance = "light" | "dark";

// ─── Themes ───
// Each persona owns a palette. The two names below are used
// most often — `sweetheart` for Ryku, `protector` for Takshu —
// but all six exist in index.css and can be picked manually.
export type ThemeName =
    | "sweetheart"
    | "protector"
    | "auraman"
    | "mentor"
    | "calm"
    | "savage";

// ─── Persona ───
export type Persona = "ryku" | "takshu";

// ─── Persona → palette mapping ───
// Switching souls retints the entire app. Kept here (not in
// types/chat) so anything that imports from `lib/types` gets it.
export const PERSONA_THEME: Record<Persona, ThemeName> = {
    ryku: "sweetheart",
    takshu: "protector",
};

// ─── UI Preferences ───
// Everything below is a *real* setting the app reads and applies.
// If a toggle isn't wired to behavior, it does not belong here.
export interface AppSettings {
    // Appearance
    appearance: Appearance;
    themeName: ThemeName;

    // Chat behaviour
    enterToSend: boolean;
    showTimestamps: boolean;
    showMessageActions: boolean;
    autoScroll: boolean;
    markdownRendering: boolean;
    showAiStatus: boolean;

    // Personalisation
    customInstructions: string;
    useConversationContext: boolean;

    // Memory & privacy
    memory: boolean;
    temporaryChat: boolean;
    chatHistory: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
    appearance: "light",
    themeName: "sweetheart",

    enterToSend: true,
    showTimestamps: false,
    showMessageActions: true,
    autoScroll: true,
    markdownRendering: true,
    showAiStatus: true,

    customInstructions: "",
    useConversationContext: true,

    memory: true,
    temporaryChat: false,
    chatHistory: true,
};