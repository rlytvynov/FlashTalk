export async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options?.headers
        }
    });

    if (!response.ok) {
        const errorResponse = await response.json().catch(() => null);
        throw new Error(errorResponse?.message || 'Неизвестная ошибка');
    }

    return await response.json();
}

export async function fetchDataAuth<T>(url: string, options?: RequestInit): Promise<T> {
    return await fetchData(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem(import.meta.env.VITE_JWT_KEY_TO_LOCAL_STORAGE ?? "")}`,
            'Content-Type': 'application/json'
        }
    });
}