import type { ConstellationData, User } from '../types';

const API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_API_BASE) ||
  'http://localhost:4000';

const getAuthHeaders = (token?: string) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.message as string)) || 'Request failed';
    throw new Error(message);
  }
  return data;
};

export interface AuthResult {
  token: string;
  user: User;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },
  async me(token: string): Promise<User> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        ...getAuthHeaders(token),
      },
      credentials: 'include',
    });
    const data = await handleResponse(res);
    return data.user as User;
  },
};

export const actionsApi = {
  async list(token?: string): Promise<ConstellationData[]> {
    const res = await fetch(`${API_BASE}/api/actions`, {
      headers: {
        ...getAuthHeaders(token),
      },
      credentials: 'include',
    });
    const data = await handleResponse(res);
    return data.data as ConstellationData[];
  },
  async create(payload: Partial<ConstellationData>, token: string) {
    const res = await fetch(`${API_BASE}/api/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async update(
    actionId: string,
    payload: Partial<ConstellationData>,
    token: string,
  ) {
    const res = await fetch(`${API_BASE}/api/actions/${actionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async join(
    actionId: string,
    payload: {
      motivation: string;
      selectedTags?: string[];
      resourceDescription: string;
      phone: string;
    },
    token: string,
  ) {
    const res = await fetch(`${API_BASE}/api/actions/${actionId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async interact(
    actionId: string,
    type: 'support' | 'meaningful' | 'interested',
    token: string,
  ) {
    const res = await fetch(`${API_BASE}/api/actions/${actionId}/interact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      credentials: 'include',
      body: JSON.stringify({ type }),
    });
    return handleResponse(res);
  },
  async interestedList(token: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/api/users/me/interested`, {
      headers: {
        ...getAuthHeaders(token),
      },
      credentials: 'include',
    });
    const data = await handleResponse(res);
    return data.actionIds as string[];
  },
};

export const aiApi = {
  async recommend(
    params: { query: string; interestedIds?: string[] },
    token?: string,
  ): Promise<string[]> {
    const res = await fetch(`${API_BASE}/api/ai/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });
    const data = await handleResponse(res);
    return (data.ids as string[]) || [];
  },
};
