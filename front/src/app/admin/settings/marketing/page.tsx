"use client";

import { Button } from "@/components/ui/button";

export default function AdminMarketingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Маркетинг</h1>

      <div className="space-y-6">
        {/* Analytics */}
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Аналитика</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Google Analytics ID
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Яндекс.Метрика ID
              </label>
              <input
                type="text"
                placeholder="12345678"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Facebook Pixel ID
              </label>
              <input
                type="text"
                placeholder="1234567890"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
          </div>
          <Button size="sm" className="mt-4">Сохранить</Button>
        </div>

        {/* UTM */}
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">UTM-метки</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm">
              <input type="checkbox" defaultChecked className="mr-2" />
              Отслеживать UTM-метки
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Автоматическое сохранение utm_source, utm_medium, utm_campaign при регистрации
          </p>
        </div>

        {/* SEO defaults */}
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">SEO по умолчанию</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Meta Title
              </label>
              <input
                type="text"
                placeholder="Darba AI Studio"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Meta Description
              </label>
              <textarea
                placeholder="Платформа AI-инструментов..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none"
              />
            </div>
          </div>
          <Button size="sm" className="mt-4">Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
