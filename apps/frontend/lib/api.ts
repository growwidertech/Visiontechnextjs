export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('vts_admin_token') : null;

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
    cache: options.cache || 'no-store',
  });

  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: T;
  };
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `API Error (${res.status})`);
  }
  return json.data as T;
}

export async function fetchPublicBundle() {
  try {
    const { getPublicBundle } = await import('@/lib/cms/queries');
    return await getPublicBundle();
  } catch {
    try {
      return await apiFetch('/dashboard/public-bundle');
    } catch {
      return null;
    }
  }
}
