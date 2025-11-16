// frontend/src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request(path, opts = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, { ...opts, credentials: 'include' });
  const contentType = res.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text().catch(() => null);
  }
  if (!res.ok) {
    const err = new Error(body?.error || body?.message || res.statusText || 'API error');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  // Auth
  login: (email, password) => request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }),
  signup: (email, password) => request('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  // Enhance / Generate
  enhance: (prompt) => request('/api/enhance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) }),
  generate: (body) => request('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  saveGeneration: (payload) => request('/api/generate/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),

  // Generations
  getGenerations: () => request('/api/generate/generations'),
  deleteGeneration: (id) => request(`/api/generate/generations/${id}`, { method: 'DELETE' }),
};

export default api;
