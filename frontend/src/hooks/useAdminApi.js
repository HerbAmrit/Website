import { useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";

async function handle(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

export function useAdminApi() {
  const { token } = useAuth();
  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const get = useCallback((path) => fetch(`/api/admin${path}`, { headers: authHeaders }).then(handle), [token]);
  const post = useCallback((path, body) => fetch(`/api/admin${path}`, { method: "POST", headers: authHeaders, body: JSON.stringify(body) }).then(handle), [token]);
  const put = useCallback((path, body) => fetch(`/api/admin${path}`, { method: "PUT", headers: authHeaders, body: JSON.stringify(body) }).then(handle), [token]);
  const patch = useCallback((path, body) => fetch(`/api/admin${path}`, { method: "PATCH", headers: authHeaders, body: JSON.stringify(body) }).then(handle), [token]);
  const del = useCallback((path) => fetch(`/api/admin${path}`, { method: "DELETE", headers: authHeaders }).then(handle), [token]);

  return { get, post, put, patch, del, token };
}
