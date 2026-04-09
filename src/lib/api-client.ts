/**
 * Centralizado API client with consistent error handling
 */

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
    ok: boolean;
}

export async function apiClient<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        const data = await response.json();

        return {
            data: response.ok ? data : undefined,
            error: response.ok ? undefined : data.error || 'Error en la solicitud',
            status: response.status,
            ok: response.ok,
        };
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        return {
            error: 'Error de conexión',
            status: 0,
            ok: false,
        };
    }
}

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await apiClient<T>(endpoint, options);
    if (!response.ok) {
        throw new Error(response.error || 'API error');
    }
    return response.data as T;
}

export async function postJson<T>(endpoint: string, body: any): Promise<T> {
    return fetchJson<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export async function getJson<T>(endpoint: string): Promise<T> {
    return fetchJson<T>(endpoint, {
        method: 'GET',
    });
}
