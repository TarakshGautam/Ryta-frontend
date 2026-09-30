// ─────────────────────────────────────────────
// RyTa.AI — API Client
// Shared transport for every call to the live Worker.
//
// The Worker authenticates with a plain `x-user-id`
// header (the Clerk user id) — not a bearer token.
// ─────────────────────────────────────────────

const RAW_BASE = import.meta.env.VITE_API_URL as string | undefined;

export const API_BASE = (RAW_BASE || "https://api.ryta.life").replace(
    /\/+$/,
    ""
);

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export function apiUrl(path: string): string {
    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function jsonHeaders(userId: string): Record<string, string> {
    return {
        "Content-Type": "application/json",
        "x-user-id": userId,
    };
}

async function unwrap<T>(res: Response): Promise<T> {
    const raw = await res.text();

    let parsed: unknown = null;
    if (raw) {
        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = null;
        }
    }

    if (!res.ok) {
        const err = parsed as { error?: string } | null;
        throw new ApiError(
            err?.error || `Request failed (${res.status})`,
            res.status
        );
    }

    return (parsed ?? { success: true }) as T;
}

export async function apiGet<T>(
    path: string,
    userId: string
): Promise<T> {
    const res = await fetch(apiUrl(path), {
        method: "GET",
        headers: jsonHeaders(userId),
    });
    return unwrap<T>(res);
}

export async function apiSend<T>(
    path: string,
    userId: string,
    body: unknown
): Promise<T> {
    const res = await fetch(apiUrl(path), {
        method: "POST",
        headers: jsonHeaders(userId),
        body: JSON.stringify(body),
    });
    return unwrap<T>(res);
}

export async function apiPatch<T>(
    path: string,
    userId: string,
    body: unknown
): Promise<T> {
    const res = await fetch(apiUrl(path), {
        method: "PATCH",
        headers: jsonHeaders(userId),
        body: JSON.stringify(body),
    });
    return unwrap<T>(res);
}

export async function apiDelete<T>(
    path: string,
    userId: string
): Promise<T> {
    const res = await fetch(apiUrl(path), {
        method: "DELETE",
        headers: jsonHeaders(userId),
    });
    return unwrap<T>(res);
}

// ─────────────────────────────────────────────
// Envelope unwrapping
// Every endpoint answers { success, data }.
// ─────────────────────────────────────────────

export interface Envelope<T> {
    success?: boolean;
    data?: T;
    error?: string;
}

export function envelopeData<T>(res: Envelope<T>): T {
    if (res?.data === undefined) {
        throw new ApiError(res?.error || "Empty response from server.", 500);
    }
    return res.data;
}
