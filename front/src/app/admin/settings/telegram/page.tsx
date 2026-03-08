"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export default function AdminTelegramPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSetWebhook() {
    try {
      await apiFetch("/admin/settings/telegram/webhook", {
        method: "POST",
        body: JSON.stringify({ url: webhookUrl }),
      });
      setStatus("Webhook установлен");
    } catch {
      setStatus("Ошибка при установке webhook");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Telegram Bot</h1>

      <div className="space-y-6">
        {/* Bot token */}
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Настройки бота</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Bot Token (env: TELEGRAM_BOT_TOKEN)
              </label>
              <input
                type="password"
                placeholder="Задаётся через переменную окружения"
                disabled
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Токен задаётся в .env файле сервера
              </p>
            </div>
          </div>
        </div>

        {/* Webhook */}
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Webhook</h2>
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="https://yourdomain.com/api/telegram/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
            />
            <Button size="sm" onClick={handleSetWebhook}>
              Установить
            </Button>
          </div>
          {status && (
            <p className="text-sm mt-2 text-muted-foreground">{status}</p>
          )}
        </div>

        {/* Commands info */}
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Команды бота</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">/start</code>
              <span className="text-muted-foreground">Привязка аккаунта и приветствие</span>
            </div>
            <div className="flex gap-3">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">/help</code>
              <span className="text-muted-foreground">Список команд</span>
            </div>
            <div className="flex gap-3">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">/status</code>
              <span className="text-muted-foreground">Статус AI-задач</span>
            </div>
            <div className="flex gap-3">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">/balance</code>
              <span className="text-muted-foreground">Баланс токенов</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
