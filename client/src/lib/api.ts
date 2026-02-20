const BASE = "/api";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  logout: () =>
    request("/auth/logout", { method: "POST" }),

  me: () =>
    request("/auth/me"),

  // Users
  getUser: (id: number) =>
    request(`/users/${id}`),

  updateProfile: (data: any) =>
    request("/users/me", { method: "PUT", body: JSON.stringify(data) }),

  // Projects
  createProject: (data: any) =>
    request("/projects", { method: "POST", body: JSON.stringify(data) }),

  getProjects: (mine?: boolean) =>
    request(`/projects${mine ? "?mine=true" : ""}`),

  getProject: (id: number) =>
    request(`/projects/${id}`),

  updateProject: (id: number, data: any) =>
    request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  getMatches: (projectId: number) =>
    request(`/projects/${projectId}/matches`),

  // Collaboration requests
  sendRequest: (data: { project_id: number; message?: string }) =>
    request("/collaborations/requests", { method: "POST", body: JSON.stringify(data) }),

  getIncomingRequests: () =>
    request("/collaborations/requests/incoming"),

  getOutgoingRequests: () =>
    request("/collaborations/requests/outgoing"),

  respondToRequest: (id: number, status: "accepted" | "declined") =>
    request(`/collaborations/requests/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

  // Collaborations
  getCollaborations: () =>
    request("/collaborations"),

  getCollaboration: (id: number) =>
    request(`/collaborations/${id}`),

  // Check-ins
  submitCheckin: (collabId: number, data: { completed: string; blocked: string; next_steps: string }) =>
    request(`/collaborations/${collabId}/checkins`, { method: "POST", body: JSON.stringify(data) }),

  getCheckins: (collabId: number) =>
    request(`/collaborations/${collabId}/checkins`),
};
