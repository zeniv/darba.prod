"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, MessageCircle, Share2 } from "lucide-react";

interface SocialConnection {
  id: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
}

const PROVIDERS = [
  {
    key: "vk",
    name: "ВКонтакте",
    icon: Share2,
    color: "text-blue-500",
  },
  {
    key: "telegram",
    name: "Telegram",
    icon: MessageCircle,
    color: "text-sky-500",
  },
];

export default function ProfileIntegrationsPage() {
  const queryClient = useQueryClient();

  const { data: connections } = useQuery({
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

      <div className="space-y-4">
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

      {/* Telegram linking instructions */}
      <div className="mt-8 border border-dashed border-border rounded-xl p-6">
        <h2 className="font-semibold mb-3">Привязка Telegram</h2>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Откройте бот в Telegram</li>
          <li>Отправьте команду /start</li>
          <li>Бот привяжет ваш аккаунт для уведомлений</li>
        </ol>
      </div>
    </div>
  );
}
