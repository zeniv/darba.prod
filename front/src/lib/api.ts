const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json();
}

/**
 * Authenticated API fetch — auto-injects Bearer token from localStorage.
 * Use for admin pages and any endpoint that requires auth.
 */
export function authFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("darba_token")
      : null;
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ── Plans ──

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: string;
  currency: string;
  period: string;
  tokens: number;
  features: Record<string, boolean | string>;
  isActive: boolean;
  sortOrder: number;
}

export function fetchPlans(): Promise<Plan[]> {
  return apiFetch<Plan[]>("/plans");
}

// ── Payments ──

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  provider: string;
  status: string;
  createdAt: string;
  plan: { displayName: string };
}

export function fetchPaymentHistory(token: string): Promise<Payment[]> {
  return apiFetch<Payment[]>("/payments/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchTokenBalance(token: string): Promise<{ balance: number }> {
  return apiFetch<{ balance: number }>("/payments/balance", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createPayment(
  token: string,
  planId: string,
  provider: string = "yookassa",
): Promise<{ paymentId: string; confirmationUrl: string }> {
  return apiFetch("/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ planId, provider }),
  });
}

// ── AI Tasks ──

export interface AiTask {
  id: string;
  agentType: string;
  status: string;
  result?: string;
  mediaUrl?: string;
  error?: string;
  tokensUsed: number;
  createdAt: string;
  updatedAt: string;
}

export function runAiTask(
  token: string,
  agentType: string,
  params: Record<string, unknown>,
  provider?: string,
  model?: string,
): Promise<{ taskId: string; status: string; tokensUsed: number }> {
  return apiFetch("/ai/run", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agentType, params, provider, model }),
  });
}

export function fetchTaskStatus(token: string, taskId: string): Promise<AiTask> {
  return apiFetch<AiTask>(`/ai/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchUserTasks(token: string): Promise<AiTask[]> {
  return apiFetch<AiTask[]>("/ai/tasks", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Integrations ──

export interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
}

export function fetchUserKeys(token: string): Promise<Integration[]> {
  return apiFetch<Integration[]>("/integrations/keys", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addApiKey(
  token: string,
  provider: string,
  apiKey: string,
): Promise<{ ok: boolean }> {
  return apiFetch("/integrations/keys", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: "ai_key", provider, apiKey }),
  });
}

export function removeApiKey(
  token: string,
  id: string,
): Promise<{ ok: boolean }> {
  return apiFetch(`/integrations/keys/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Notifications ──

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export function fetchNotifications(token: string): Promise<Notification[]> {
  return apiFetch<Notification[]>("/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchUnreadCount(token: string): Promise<{ count: number }> {
  return apiFetch<{ count: number }>("/notifications/unread-count", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Content (Posts) ──

export interface PostUser {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Post {
  id: string;
  title: string | null;
  content: string | null;
  mediaUrls: string[];
  mediaType: string | null;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  user: PostUser;
  _count: { likes: number; comments: number };
}

export function fetchPublicFeed(cursor?: string): Promise<Post[]> {
  const params = cursor ? `?cursor=${cursor}` : "";
  return apiFetch<Post[]>(`/posts/feed${params}`);
}

export function fetchPost(postId: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${postId}`);
}

// ── Social ──

export function toggleLike(
  token: string,
  postId: string,
): Promise<{ liked: boolean }> {
  return apiFetch(`/social/posts/${postId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchComments(postId: string): Promise<unknown[]> {
  return apiFetch(`/social/posts/${postId}/comments`);
}

export function fetchFollowCounts(
  userId: string,
): Promise<{ followers: number; following: number }> {
  return apiFetch(`/social/users/${userId}/counts`);
}

// ── Social OAuth / Integrations ──

export interface SocialConnection {
  id: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
}

export function fetchSocialConnections(
  token: string,
): Promise<SocialConnection[]> {
  return apiFetch<SocialConnection[]>("/oauth/connections", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function disconnectProvider(
  token: string,
  provider: string,
): Promise<{ ok: boolean }> {
  return apiFetch(`/oauth/${provider}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getVkAuthUrl(
  token: string,
): Promise<{ url: string }> {
  return apiFetch<{ url: string }>("/oauth/vk/url", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Support ──

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export function fetchTickets(token: string): Promise<SupportTicket[]> {
  return apiFetch<SupportTicket[]>("/support/tickets", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchTicket(token: string, id: string): Promise<SupportTicket> {
  return apiFetch<SupportTicket>(`/support/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createTicket(
  token: string,
  subject: string,
  message: string,
): Promise<SupportTicket> {
  return apiFetch<SupportTicket>("/support/tickets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ subject, message }),
  });
}

export function addTicketMessage(
  token: string,
  ticketId: string,
  content: string,
): Promise<SupportMessage> {
  return apiFetch<SupportMessage>(`/support/tickets/${ticketId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
}
