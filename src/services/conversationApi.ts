// ─────────────────────────────────────────────
// RyTa.AI — Conversation API
// Full CRUD over /api/conversations
// ─────────────────────────────────────────────

import {
    apiDelete,
    apiGet,
    apiPatch,
    envelopeData,
    type Envelope,
} from "./apiClient";
import type {
    ConversationMessage,
    ConversationSummary,
    Persona,
} from "@/types/chat";

const CONVERSATION_PATH = "/api/conversations";

// ─────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────

interface ListData {
    conversations: {
        id: string;
        title?: string | null;
        persona?: string | null;
        is_pinned?: number | null;
        created_at?: string | null;
        updated_at?: string | null;
    }[];
}

function toPersona(value: unknown): Persona {
    return value === "takshu" ? "takshu" : "ryku";
}

export async function listConversations(
    userId: string
): Promise<ConversationSummary[]> {
    const res = await apiGet<Envelope<ListData>>(
        CONVERSATION_PATH,
        userId
    );
    const rows = envelopeData(res).conversations ?? [];

    return rows
        .filter((r) => r?.id)
        .map((r) => ({
            id: String(r.id),
            title: r.title?.trim() || "Untitled",
            persona: toPersona(r.persona),
            is_pinned: r.is_pinned ? 1 : 0,
            created_at: r.created_at ?? undefined,
            updated_at: r.updated_at ?? undefined,
        }));
}

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

interface MessagesData {
    messages: {
        id: string;
        sender: string;
        content?: string | null;
        persona?: string | null;
        mood?: string | null;
        isSearchUsed?: boolean;
        createdAt?: string | null;
    }[];
}

export async function getConversationMessages(
    userId: string,
    conversationId: string
): Promise<ConversationMessage[]> {
    const res = await apiGet<Envelope<MessagesData>>(
        `${CONVERSATION_PATH}/${encodeURIComponent(conversationId)}/messages`,
        userId
    );
    const rows = envelopeData(res).messages ?? [];

    return rows
        .filter((m) => m?.id)
        .map((m) => ({
            id: String(m.id),
            // The Worker writes "assistant" over the wire.
            sender: m.sender === "user" ? "user" : "assistant",
            content: String(m.content ?? ""),
            persona: toPersona(m.persona),
            mood: m.mood ?? null,
            isSearchUsed: Boolean(m.isSearchUsed),
            createdAt: m.createdAt ?? "",
        }));
}

// ─────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────

export async function renameConversation(
    userId: string,
    id: string,
    title: string
): Promise<void> {
    await apiPatch(
        `${CONVERSATION_PATH}/${encodeURIComponent(id)}/rename`,
        userId,
        { title }
    );
}

export async function pinConversation(
    userId: string,
    id: string,
    pinned: boolean
): Promise<void> {
    await apiPatch(
        `${CONVERSATION_PATH}/${encodeURIComponent(id)}/pin`,
        userId,
        { pinned }
    );
}

export async function archiveConversation(
    userId: string,
    id: string,
    archived: boolean
): Promise<void> {
    await apiPatch(
        `${CONVERSATION_PATH}/${encodeURIComponent(id)}/archive`,
        userId,
        { archived }
    );
}

export async function deleteConversation(
    userId: string,
    id: string
): Promise<void> {
    await apiDelete(`${CONVERSATION_PATH}/${encodeURIComponent(id)}`, userId);
}
