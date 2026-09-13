export const API_URL = import.meta.env.VITE_API_URL || "https://xevoprop.onrender.com/api";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
