// ─────────────────────────────────────────────
// RyTa.AI — Chat API
// POST /api/chat  ·  POST /api/tts
// ─────────────────────────────────────────────

import { apiSend, apiUrl, envelopeData, type Envelope } from "./apiClient";
import type { Attachment, Persona } from "@/types/chat";

export interface SendMessageInput {
    message: string;
    conversationId?: string | null;
    persona: Persona;
    webSearch?: boolean;
    attachments?: Attachment[];
}

export interface SendMessageResult {
    conversationId: string;
    message: string;
    mood: string | null;
    isSearchUsed: boolean;
    userMessageId: string;
    assistantMessageId: string;
}

interface ChatData {
    conversationId: string;
    message: string;
    mood: string | null;
    isSearchUsed: boolean;
    userMessageId: string;
    assistantMessageId: string;
}

/**
 * POST /api/chat
 * Passing no conversationId makes the Worker open a new
 * conversation and return its id.
 */
export async function sendMessage(
    userId: string,
    input: SendMessageInput
): Promise<SendMessageResult> {
    const body: Record<string, unknown> = {
        message: input.message,
        persona: input.persona,
        web_search: input.webSearch ?? false,
    };

    if (input.conversationId) {
        body.conversation_id = input.conversationId;
    }

    if (input.attachments?.length) {
        body.attachments = input.attachments;
    }

    const res = await apiSend<Envelope<ChatData>>("/api/chat", userId, body);
    const data = envelopeData(res);

    if (!data.conversationId || !data.message) {
        throw new Error("Incomplete reply from server.");
    }

    return {
        conversationId: String(data.conversationId),
        message: String(data.message),
        mood: data.mood ?? null,
        isSearchUsed: Boolean(data.isSearchUsed),
        userMessageId: String(data.userMessageId ?? ""),
        assistantMessageId: String(data.assistantMessageId ?? ""),
    };
}

// ─────────────────────────────────────────────
// TTS
// POST /api/tts → raw audio/mpeg
// ─────────────────────────────────────────────

export async function fetchSpeechAudio(
    text: string,
    signal?: AbortSignal
): Promise<Blob> {
    const res = await fetch(apiUrl("/api/tts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(
            (err as { error?: string } | null)?.error || "Could not speak that."
        );
    }

    return res.blob();
}
