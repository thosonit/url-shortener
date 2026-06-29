const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  meta?: { page: number; limit: number; total: number };
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setToken(token: string): void {
  localStorage.setItem("admin_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("admin_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthenticated");
  }

  const json: ApiResponse<T> = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Unknown error");
  }
  return json;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "super_admin";
}

export interface StatsData {
  totalLinks: number;
  linksToday: number;
  totalUsers: number;
  totalClicks: number;
}

export interface LinkItem {
  id: string;
  code: string;
  originalUrl: string;
  status: "active" | "disabled" | "expired";
  clickCount: number;
  expiresAt: string | null;
  createdAt: string;
  ownerEmail: string | null;
}

export interface UserItem {
  id: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  status: "active" | "suspended";
  createdAt: string;
  linkCount?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: { page: number; limit: number; total: number };
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  const res = await request<AuthData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data!;
}

function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export async function getStats(): Promise<StatsData> {
  const res = await request<StatsData>("/api/admin/stats");
  return res.data!;
}

export async function getLinks(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedResult<LinkItem>> {
  const res = await request<LinkItem[]>(`/api/admin/links${qs(params)}`);
  return { items: res.data!, meta: res.meta! };
}

export async function getLinkDetail(id: string): Promise<LinkItem> {
  const res = await request<LinkItem>(`/api/admin/links/${id}`);
  return res.data!;
}

export async function patchLink(
  id: string,
  body: { status?: string; forceExpire?: boolean }
): Promise<LinkItem> {
  const res = await request<LinkItem>(`/api/admin/links/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data!;
}

export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResult<UserItem>> {
  const res = await request<UserItem[]>(`/api/admin/users${qs(params)}`);
  return { items: res.data!, meta: res.meta! };
}

export async function getUserDetail(id: string): Promise<UserItem> {
  const res = await request<UserItem>(`/api/admin/users/${id}`);
  return res.data!;
}

export async function getUserLinks(
  id: string,
  params: { page?: number; limit?: number }
): Promise<PaginatedResult<LinkItem>> {
  const res = await request<LinkItem[]>(
    `/api/admin/users/${id}/links${qs(params)}`
  );
  return { items: res.data!, meta: res.meta! };
}

export async function patchUser(
  id: string,
  body: { status?: string }
): Promise<UserItem> {
  const res = await request<UserItem>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data!;
}

export async function assignRole(
  id: string,
  role: string
): Promise<UserItem> {
  const res = await request<UserItem>(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return res.data!;
}
