import axios, { type AxiosInstance, type AxiosError } from "axios";

export function isAxiosError(err: unknown): err is AxiosError {
  return axios.isAxiosError(err);
}

export function getApiErrorMessage(err: unknown): string {
  if (!isAxiosError(err)) return "Something went wrong";
  const data = err.response?.data;
  const status = err.response?.status;
  if (data && typeof data === "object") {
    if ("error" in data && typeof (data as { error: unknown }).error === "string")
      return (data as { error: string }).error;
    if ("message" in data && typeof (data as { message: unknown }).message === "string")
      return (data as { message: string }).message;
  }
  if (err.code === "ERR_NETWORK" || !err.response)
    return "Cannot reach the server. Is the backend running?";
  if (status === 404) return "Not found.";
  if (status && status >= 500) return "Server error. Try again later.";
  return "Something went wrong.";
}

const baseURL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000")
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

const AUTH_TOKEN_KEY = "rana4-token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (isAxiosError(err) && err.response?.status === 401) {
      setStoredToken(null);
    }
    return Promise.reject(err);
  }
);

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post<{ user: User; token: string }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>("/auth/login", data),
  me: () => api.get<User>("/auth/me"),
  updateMe: (data: { name?: string }) => api.put<User>("/auth/me", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<unknown>("/auth/me/password", data),
};

export type Standard = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export const standardsApi = {
  list: () => api.get<Standard[]>("/standards"),
  get: (id: string) => api.get<Standard>(`/standards/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post<Standard>("/standards", data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<Standard>(`/standards/${id}`, data),
  delete: (id: string) => api.delete(`/standards/${id}`),
};

export type Fragnet = {
  id: string;
  standardId: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export const fragnetsApi = {
  listByStandard: (standardId: string) =>
    api.get<Fragnet[]>(`/fragnets/standard/${standardId}`),
  get: (id: string) => api.get<Fragnet>(`/fragnets/${id}`),
  create: (data: { standardId: string; name: string; description?: string }) =>
    api.post<Fragnet>("/fragnets", data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<Fragnet>(`/fragnets/${id}`, data),
  delete: (id: string) => api.delete(`/fragnets/${id}`),
};

export type Activity = {
  id: string;
  fragnetId: string;
  activityCode: string;
  name: string;
  bestDuration: number;
  likelyDuration: number;
  assuranceNoteId: string | null;
  createdAt: string;
};

export const activitiesApi = {
  listByFragnet: (fragnetId: string) =>
    api.get<Activity[]>(`/activities/fragnet/${fragnetId}`),
  get: (id: string) => api.get<Activity>(`/activities/${id}`),
  create: (data: {
    fragnetId: string;
    activityCode: string;
    name: string;
    bestDuration: number;
    likelyDuration: number;
    assuranceNoteId?: string | null;
  }) => api.post<Activity>("/activities", data),
  update: (id: string, data: {
    activityCode?: string;
    name?: string;
    bestDuration?: number;
    likelyDuration?: number;
    assuranceNoteId?: string | null;
  }) => api.put<Activity>(`/activities/${id}`, data),
  delete: (id: string) => api.delete(`/activities/${id}`),
};

export type RelationshipType = "FS" | "SS" | "FF" | "SF";

export type Relationship = {
  id: string;
  fragnetId: string;
  predecessorActivityId: string;
  successorActivityId: string;
  relationshipType: RelationshipType;
  lag: number;
};

export const relationshipsApi = {
  listByFragnet: (fragnetId: string) =>
    api.get<Relationship[]>(`/relationships/fragnet/${fragnetId}`),
  create: (data: {
    fragnetId: string;
    predecessorActivityId: string;
    successorActivityId: string;
    relationshipType: RelationshipType;
    lag?: number;
  }) => api.post<Relationship>("/relationships", data),
  delete: (id: string) => api.delete(`/relationships/${id}`),
};

export type Deliverable = {
  id: string;
  fragnetId: string | null;
  name: string;
  bestDuration: number;
  likelyDuration: number;
  createdAt: string;
};

export const deliverablesApi = {
  /** List all deliverables, optionally filter by fragnetId. */
  list: (fragnetId?: string) =>
    api.get<Deliverable[]>("/deliverables", fragnetId ? { params: { fragnetId } } : undefined),
  /** List deliverables for a fragnet. */
  listByFragnet: (fragnetId: string) =>
    api.get<Deliverable[]>(`/deliverables/fragnet/${fragnetId}`),
  get: (id: string) => api.get<Deliverable>(`/deliverables/${id}`),
  create: (data: {
    fragnetId?: string | null;
    name: string;
    bestDuration: number;
    likelyDuration: number;
  }) => api.post<Deliverable>("/deliverables", data),
  update: (id: string, data: {
    fragnetId?: string | null;
    name?: string;
    bestDuration?: number;
    likelyDuration?: number;
  }) => api.put<Deliverable>(`/deliverables/${id}`, data),
  delete: (id: string) => api.delete(`/deliverables/${id}`),
};

export type AssuranceNote = {
  id: string;
  standardId: string;
  noteText: string;
  createdAt: string;
};

export const assuranceNotesApi = {
  listByStandard: (standardId: string) =>
    api.get<AssuranceNote[]>(`/assurance-notes/standard/${standardId}`),
  create: (data: { standardId: string; noteText: string }) =>
    api.post<AssuranceNote>("/assurance-notes", data),
  delete: (id: string) => api.delete(`/assurance-notes/${id}`),
};

export const exportApi = {
  /** Downloads Excel (.xlsx) with sheets TASK and TASKPRED. POST body: scenario, projectName, projectId, optional includeUnassignedDeliverables. Returns blob for one file download. */
  fragnet: (
    fragnetId: string,
    body: {
      scenario: "best" | "likely";
      projectName: string;
      projectId: string;
      /** IDs of unassigned (no fragnet) deliverables to include in export, one by one. */
      unassignedDeliverableIds?: string[];
    }
  ) =>
    api.post<Blob>(`/export/fragnet/${fragnetId}`, body, {
      responseType: "blob",
    }),
};
