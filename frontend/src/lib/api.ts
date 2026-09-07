const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach Bearer token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include', // Ensures cross-origin cookies are sent and received
  };

  const response = await fetch(url, config);

  // If client-side and unauthenticated 401 on protected endpoint, redirect to login
  if (
    response.status === 401 &&
    typeof window !== 'undefined' &&
    !path.includes('/api/auth/login') &&
    !path.includes('/api/auth/register') &&
    !path.includes('/api/auth/me')
  ) {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  }

  return response;
}
