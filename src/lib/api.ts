// API client helper functions

const getAuthHeaders = () => {
  const token = localStorage.getItem('focusbeats_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://focus-beats-backend.vercel.app';

export const api = {
  async get(endpoint: string) {
    const res = await fetch(`${BASE_URL}/api${endpoint}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'API Error');
    }
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}/api${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'API Error');
    }
    return res.json();
  },

  async patch(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}/api${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'API Error');
    }
    return res.json();
  },

  async delete(endpoint: string) {
    const res = await fetch(`${BASE_URL}/api${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'API Error');
    }
    return res.json();
  }
};
