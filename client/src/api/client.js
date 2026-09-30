const API_URL = import.meta.env.VITE_API_URL;

let csrfToken = null;

export function clearCsrfToken() {
  csrfToken = null;
}

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${API_URL}/api/csrf-token`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("No se pudo obtener el token CSRF");
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function request(path, { method = "GET", body, needsCsrf = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (needsCsrf) headers["x-csrf-token"] = await getCsrfToken();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearCsrfToken();
    const err = new Error("No autenticado");
    err.status = 401;
    throw err;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || "Error de servidor");
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),

  listEvents: (scope) =>
    request(`/api/events${scope ? `?scope=${scope}` : ""}`),
  getEvent: (id) => request(`/api/events/${id}`),
  createEvent: (data) =>
    request("/api/events", { method: "POST", body: data, needsCsrf: true }),
  updateEvent: (id, data) =>
    request(`/api/events/${id}`, {
      method: "PUT",
      body: data,
      needsCsrf: true,
    }),
  deleteEvent: (id) =>
    request(`/api/events/${id}`, { method: "DELETE", needsCsrf: true }),
};
