const API_BASE_URL =
    (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_API_URL) ||
    "https://ryta-ai-backend.onrender.com";

export interface DiaryEntry {
    id: string;
    title: string | null;
    content: string;
    mood: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DiaryEntryInput {
    title?: string;
    content: string;
    mood?: string | null;
}

interface BackendRow {
    id: string;
    title: string | null;
    content: string;
    mood: string | null;
    createdAt: string;
    updatedAt: string;
}

async function getClerkToken(): Promise<string> {
    try {
        const win = window as unknown as {
            Clerk?: { session?: { getToken: () => Promise<string> } };
        };
        const clerk = win.Clerk;
        if (clerk?.session) return await clerk.session.getToken();
    } catch (e) {
        console.warn("Clerk token fetch failed:", e);
    }
    return "";
}

function authHeaders(token: string): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
}

function mapRow(r: BackendRow): DiaryEntry {
    return {
        id: r.id,
        title: r.title ?? null,
        content: r.content ?? "",
        mood: r.mood ?? null,
        createdAt: r.createdAt ?? "",
        updatedAt: r.updatedAt ?? "",
    };
}

async function handle<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed (${res.status})`);
    }
    return res.json();
}

export async function listDiaryEntries(): Promise<DiaryEntry[]> {
    const token = await getClerkToken();
    const res = await fetch(`${API_BASE_URL}/api/diary`, {
        headers: authHeaders(token),
    });
    const data = await handle<{ data?: { entries?: BackendRow[] } }>(res);
    const rows = data?.data?.entries ?? [];
    return rows.map(mapRow);
}

export async function getDiaryEntry(id: string): Promise<DiaryEntry> {
    const token = await getClerkToken();
    const res = await fetch(
        `${API_BASE_URL}/api/diary/${encodeURIComponent(id)}`,
        { headers: authHeaders(token) }
    );
    const data = await handle<{ data?: BackendRow }>(res);
    const row = data?.data;
    if (!row) throw new Error("Entry not found.");
    return mapRow(row);
}

export async function createDiaryEntry(
    input: DiaryEntryInput
): Promise<DiaryEntry> {
    const token = await getClerkToken();
    const res = await fetch(`${API_BASE_URL}/api/diary`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
            title: input.title ?? "",
            content: input.content,
            mood: input.mood ?? null,
        }),
    });
    const data = await handle<{ data?: BackendRow }>(res);
    const row = data?.data;
    if (!row) throw new Error("Create failed.");
    return mapRow(row);
}

export async function updateDiaryEntry(
    id: string,
    patch: Partial<DiaryEntryInput>
): Promise<DiaryEntry> {
    const token = await getClerkToken();
    const body: Record<string, unknown> = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.content !== undefined) body.content = patch.content;
    if (patch.mood !== undefined) body.mood = patch.mood;

    const res = await fetch(
        `${API_BASE_URL}/api/diary/${encodeURIComponent(id)}`,
        {
            method: "PATCH",
            headers: authHeaders(token),
            body: JSON.stringify(body),
        }
    );
    await handle(res);
    return getDiaryEntry(id);
}

export async function deleteDiaryEntry(id: string): Promise<void> {
    const token = await getClerkToken();
    const res = await fetch(
        `${API_BASE_URL}/api/diary/${encodeURIComponent(id)}`,
        {
            method: "DELETE",
            headers: authHeaders(token),
        }
    );
    await handle(res);
}