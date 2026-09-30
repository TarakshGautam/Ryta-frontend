// ─────────────────────────────────────────────
// RyTa.AI — Chat Type Definitions
// Mirrors the live Cloudflare Worker contract.
// No sub-modes: the backend has exactly two personalities.
// ─────────────────────────────────────────────

import type { ThemeName } from "@/lib/types";

export type Persona = "ryku" | "takshu";

export type MessageSender = "user" | "ai";

export type MessageFeedback = "liked" | "disliked" | null;

export interface Message {
    id: string;
    sender: MessageSender;
    text: string;
    persona: Persona;
    mood?: string | null;
    timestamp: Date;
    isSearchUsed?: boolean;
    feedback?: MessageFeedback;
}

/**
 * Images are referenced by public URL — the Worker fetches
 * them itself. `type` is the coarse kind, not a MIME type.
 */
export interface Attachment {
    url: string;
    type: "image" | "file";
}

// ─────────────────────────────────────────────
// Mood — set by the backend, parsed from the
// [MOOD:XXX] prefix on every AI reply.
// ─────────────────────────────────────────────

export type MoodTone = "rose" | "pink" | "blue" | "emerald" | "zinc";

export const MOOD_TONE: Record<string, MoodTone> = {
    LOVING: "rose",
    ROMANTIC: "rose",
    PLAYFUL: "pink",
    NAKHRA: "pink",
    CALM: "blue",
    STOIC: "blue",
    PROTECTIVE: "emerald",
    MENTOR: "emerald",
    SERIOUS: "zinc",
    BRO: "zinc",
};

export function toneForMood(mood?: string | null): MoodTone | null {
    if (!mood) return null;
    return MOOD_TONE[mood.toUpperCase()] ?? "zinc";
}

// ─────────────────────────────────────────────
// Conversations
// ─────────────────────────────────────────────

export interface ConversationSummary {
    id: string;
    title: string;
    persona: Persona;
    is_pinned?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ConversationMessage {
    id: string;
    sender: "user" | "assistant";
    content: string;
    persona?: Persona;
    mood?: string | null;
    isSearchUsed?: boolean;
    createdAt: string;
}

// ─────────────────────────────────────────────
// Persona metadata
// ─────────────────────────────────────────────

export interface PersonaMeta {
    id: Persona;
    name: string;
    description: string;
    avatar: string;
    greeting: string;
}

export const PERSONAS: Record<Persona, PersonaMeta> = {
    ryku: {
        id: "ryku",
        name: "Ryku",
        description: "Warm, expressive, a little dramatic.",
        avatar: "/logo.png",
        greeting:
            "Bolo… main yahan hoon. Kya hua aaj?",
    },
    takshu: {
        id: "takshu",
        name: "Takshu",
        description: "Grounded, steady, keeps it real.",
        avatar: "/guest.png",
        greeting: "Baith ja, sun raha hoon. Bol.",
    },
};

export const PERSONA_ORDER: Persona[] = ["takshu", "ryku"];

export const DEFAULT_PERSONA: Persona = "ryku";

// ─────────────────────────────────────────────
// Persona → palette. Switching souls retints the app:
// Ryku is the warm rose one, Takshu the grounded burgundy one.
// ─────────────────────────────────────────────

export const PERSONA_THEME: Record<Persona, ThemeName> = {
    ryku: "sweetheart",
    takshu: "protector",
};
