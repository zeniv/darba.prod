"use client";

import { Button } from "@/components/ui/button";

export default function AdminPaymentsSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Настройки платежей</h1>

      <div className="space-y-6">
        {/* YooKassa */}
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">ЮКасса</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Shop ID</label>
              <input
                type="text"
                placeholder="shopId"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Secret Key</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
          </div>
          <Button size="sm" className="mt-4">Сохранить</Button>
        </div>

        {/* Stripe */}
        <div className="border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Stripe</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Secret Key</label>
              <input
                type="password"
                placeholder="sk_live_••••"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Webhook Secret</label>
              <input
                type="password"
                placeholder="whsec_••••"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
          </div>
          <Button size="sm" className="mt-4">Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
