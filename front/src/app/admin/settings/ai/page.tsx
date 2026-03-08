"use client";

import { Button } from "@/components/ui/button";

const AI_PROVIDERS = [
  { name: "Anthropic (Claude)", key: "ANTHROPIC_API_KEY" },
  { name: "OpenAI (GPT, DALL-E)", key: "OPENAI_API_KEY" },
  { name: "Stability AI", key: "STABILITY_API_KEY" },
  { name: "ElevenLabs", key: "ELEVENLABS_API_KEY" },
  { name: "RunwayML", key: "RUNWAYML_API_KEY" },
  { name: "D-ID (Lipsync)", key: "DID_API_KEY" },
];

export default function AdminAiSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Настройки AI-провайдеров</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Системные API-ключи. Используются, если у пользователя нет собственного ключа.
      </p>

      <div className="space-y-4">
        {AI_PROVIDERS.map((provider) => (
          <div key={provider.key} className="border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm">{provider.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{provider.key}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-64 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
                <Button size="sm" variant="outline">
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
