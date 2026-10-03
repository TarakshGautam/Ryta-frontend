// ─────────────────────────────────────────────
// RyTa.AI — Chat API
// POST /api/chat · POST /api/chat-stream · POST /api/tts
// POST /api/conversations/:id/generate-title
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
    searchQuery: string | null;
    userMessageId: string;
    assistantMessageId: string;
}

interface ChatData {
    conversationId: string;
    message: string;
    mood: string | null;
    isSearchUsed: boolean;
    searchQuery: string | null;
    userMessageId: string;
    assistantMessageId: string;
}

// ─────────────────────────────────────────────
// Queue response shape (from /api/chat-stream)
// ─────────────────────────────────────────────
interface QueuedResponse {
    success: boolean;
    queued: boolean;
    conversationId: string;
    userMessageId: string;
    assistantMessageId: string;
    pollUrl: string;
    message: string;
}

// ─────────────────────────────────────────────
// Poll result (from /api/chat-result/:convId/:msgId)
// ─────────────────────────────────────────────
interface PollResultData {
    success: boolean;
    reply?: string;
    mood?: string;
    error?: string;
}

interface PollResponse {
    success: boolean;
    data?: PollResultData;
    pending?: boolean;
}

// ─────────────────────────────────────────────
// POST /api/chat — direct (non-queue)
// ─────────────────────────────────────────────
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
        searchQuery: data.searchQuery ?? null,
        userMessageId: String(data.userMessageId ?? ""),
        assistantMessageId: String(data.assistantMessageId ?? ""),
    };
}

// ─────────────────────────────────────────────
// POST /api/chat-stream — Queue-based with polling
// ─────────────────────────────────────────────
export async function sendMessageWithQueue(
    userId: string,
    input: SendMessageInput,
    onQueued?: (pollUrl: string) => void
): Promise<SendMessageResult> {
    const res = await fetch(apiUrl("/api/chat-stream"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
        },
        body: JSON.stringify({
            message: input.message,
            conversation_id: input.conversationId,
            persona: input.persona,
        }),
    });

    // Check content type
    const contentType = res.headers.get("content-type") || "";

    // ⚡ Queued response (JSON)
    if (contentType.includes("application/json")) {
        const data = await res.json();
        const queuedData = data.data || data;

        if (queuedData.queued && queuedData.pollUrl) {
            onQueued?.(queuedData.pollUrl);
            const result = await pollChatResult(queuedData.pollUrl);

            if (!result.success) {
                throw new Error(result.error || "Failed to get response");
            }

            return {
                conversationId: queuedData.conversationId,
                message: result.reply!,
                mood: result.mood ?? null,
                isSearchUsed: false,
                searchQuery: null,
                userMessageId: queuedData.userMessageId,
                assistantMessageId: queuedData.assistantMessageId,
            };
        }

        throw new Error("Invalid queued response");
    }

    // ⚡ SSE streaming (shayari/tools)
    if (contentType.includes("text/event-stream")) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullReply = "";
        let mood: string | null = null;
        let conversationId = "";
        let assistantMessageId = "";
        let userMessageId = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = JSON.parse(line.slice(6));

                if (data.type === "meta") {
                    conversationId = data.conversationId;
                    userMessageId = data.userMessageId;
                    assistantMessageId = data.assistantMessageId;
                }
                if (data.type === "delta") fullReply += data.text;
                if (data.type === "done") {
                    mood = data.mood;
                    fullReply = data.fullText;
                }
                if (data.type === "error") throw new Error(data.message);
            }
        }

        return {
            conversationId,
            message: fullReply,
            mood,
            isSearchUsed: false,
            searchQuery: null,
            userMessageId,
            assistantMessageId,
        };
    }

    throw new Error("Unknown response type");
}

// ─────────────────────────────────────────────
// Poll /api/chat-result/:convId/:msgId
// ─────────────────────────────────────────────
export async function pollChatResult(
    pollUrl: string,
    maxAttempts = 40,
    intervalMs = 1500
): Promise<PollResultData> {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, intervalMs));

        try {
            const res = await fetch(apiUrl(pollUrl));
            const data = (await res.json()) as PollResponse;

            // ⚡ Pending — continue
            if (data.pending || !data.data) {
                console.log(`[Poll] ${i + 1}/${maxAttempts} — pending`);
                continue;
            }

            // ⚡ Completed
            if (data.data.success) {
                return {
                    success: true,
                    reply: data.data.reply,
                    mood: data.data.mood,
                };
            }

            // ⚡ Failed
            return {
                success: false,
                error: data.data.error || "Unknown error",
            };
        } catch (e) {
            console.warn(`[Poll] ${i + 1} network error:`, e);
        }
    }

    return {
        success: false,
        error: "Timeout — response took too long",
    };
}

// ─────────────────────────────────────────────
// AI Title Generation
// ─────────────────────────────────────────────
interface GenerateTitleData {
    id: string;
    title: string;
}

export async function generateConversationTitle(
    userId: string,
    conversationId: string,
    firstMessage: string
): Promise<string | null> {
    try {
        const res = await apiSend<Envelope<GenerateTitleData>>(
            `/api/conversations/${conversationId}/generate-title`,
            userId,
            { firstMessage }
        );
        const data = envelopeData(res);
        return data?.title ?? null;
    } catch (error) {
        console.warn("[generateConversationTitle] failed:", error);
        return null;
    }
}

// ─────────────────────────────────────────────
// TTS — POST /api/tts → raw audio/mpeg
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