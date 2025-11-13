import {RequestInit} from "next/dist/server/web/spec-extension/request";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
    headers?: Record<string, string>;
}

/**
 * apiFetch: like fetch but sends cookies and attempts a single refresh if 401.
 * options: same as fetch options (method, headers, body, etc.)
 */
export async function apiFetch(
    path: string,
    options: ApiFetchOptions = {}
): Promise<Response> {
    const url = `${API_BASE}${path}`;
    const opts: RequestInit = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        cache: "no-store",
        ...options,
    };

    let res = await fetch(url, opts);

    // If unauthorized, attempt refresh (rotate refresh token)
    if (res.status === 401) {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
        });
        // If refresh succeeded, retry original request once
        if (refreshRes.ok) {
            res = await fetch(url, opts);
        }
    }

    return res;
}