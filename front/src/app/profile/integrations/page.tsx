"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, MessageCircle, Share2, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface SocialConnection {
  id: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
}

const PROVIDERS = [
  { key: "vk", name: "VK (OAuth)", icon: Share2, color: "text-blue-500" },
  { key: "telegram", name: "Telegram (уведомления)", icon: MessageCircle, color: "text-sky-500" },
];

export default function ProfileIntegrationsPage() {
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery({
    queryKey: ["social-connections"],
    queryFn: () => apiFetch<SocialConnection[]>("/oauth/connections"),
  });

  const disconnectMutation = useMutation({
    mutationFn: (provider: string) =>
      apiFetch(`/oauth/${provider}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social-connections"] }),
  });

  function getConnection(provider: string) {
    return connections?.find((c) => c.provider === provider);
  }

  async function connectVk() {
    const data = await apiFetch<{ url: string }>("/oauth/vk/url");
    window.location.href = data.url;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Интеграции</h1>

      {/* Social OAuth providers */}
      <div className="space-y-4">
        {isLoading && Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-muted animate-pulse rounded" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
          </div>
        ))}
        {PROVIDERS.map((p) => {
          const conn = getConnection(p.key);
          const Icon = p.icon;

          return (
            <div
              key={p.key}
              className="border border-border rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${p.color}`} />
                <div>
                  <div className="font-medium text-sm">{p.name}</div>
                  {conn ? (
                    <span className="text-xs text-green-600">Подключено</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Не подключено
                    </span>
                  )}
                </div>
              </div>

              {conn ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => disconnectMutation.mutate(p.key)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Отключить
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={p.key === "vk" ? connectVk : undefined}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Подключить
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Telegram Channel posting */}
      <TelegramChannelSection
        connected={!!getConnection("telegram_channel")}
        onDisconnect={() => disconnectMutation.mutate("telegram_channel")}
        onConnected={() => queryClient.invalidateQueries({ queryKey: ["social-connections"] })}
      />

      {/* Telegram bot linking */}
      <div className="mt-8 border border-dashed border-border rounded-xl p-6">
        <h2 className="font-semibold mb-3">Привязка Telegram (уведомления)</h2>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Откройте бот в Telegram</li>
          <li>Отправьте команду /start</li>
          <li>Бот привяжет ваш аккаунт для уведомлений</li>
        </ol>
      </div>
    </div>
  );
}

function TelegramChannelSection({
  connected,
  onDisconnect,
  onConnected,
}: {
  connected: boolean;
  onDisconnect: () => void;
  onConnected: () => void;
}) {
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleTest() {
    setTestStatus("testing");
    setTestError("");
    try {
      const res = await apiFetch<{ ok: boolean; error?: string }>(
        "/oauth/telegram-channel/test",
        { method: "POST", body: JSON.stringify({ botToken, channelId }) },
      );
      if (res.ok) {
        setTestStatus("ok");
      } else {
        setTestStatus("error");
        setTestError(res.error || "Unknown error");
      }
    } catch {
      setTestStatus("error");
      setTestError("Connection failed");
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiFetch("/oauth/telegram-channel", {
        method: "POST",
        body: JSON.stringify({ botToken, channelId }),
      });
      onConnected();
      setBotToken("");
      setChannelId("");
      setTestStatus("idle");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Send className="h-6 w-6 text-sky-500" />
        <div>
          <div className="font-semibold">Telegram-канал (постинг)</div>
          <span className="text-xs text-muted-foreground">
            Автоматическая публикация постов в ваш Telegram-канал
          </span>
        </div>
        {connected && (
          <span className="ml-auto text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Подключено
          </span>
        )}
      </div>

      {connected ? (
        <Button variant="ghost" size="sm" onClick={onDisconnect}>
          <Trash2 className="h-4 w-4 mr-1" />
          Отключить
        </Button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Bot Token</label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456:ABC-DEF..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Channel ID</label>
            <input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="@mychannel или -1001234567890"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          {testStatus === "ok" && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Тестовое сообщение отправлено
            </div>
          )}
          {testStatus === "error" && (
            <div className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {testError}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={!botToken || !channelId || testStatus === "testing"}
            >
              {testStatus === "testing" ? "Проверка..." : "Тестировать"}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!botToken || !channelId || saving}
            >
              {saving ? "Сохранение..." : "Подключить"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <p>1. Создайте бота через @BotFather в Telegram</p>
            <p>2. Добавьте бота администратором в ваш канал</p>
            <p>3. Вставьте bot token и ID/username канала</p>
          </div>
        </div>
      )}
    </div>
  );
}
