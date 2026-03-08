"use client";

import { Button } from "@/components/ui/button";
import { Shield, Activity } from "lucide-react";

export default function AdminSecurityPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Безопасность</h1>

      <div className="space-y-6">
        {/* Pen test */}
        <div className="border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Penetration Test (OWASP ZAP)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Запустите автоматический pen-тест для проверки уязвимостей.
          </p>
          <Button size="sm">Запустить сканирование</Button>
        </div>

        {/* Load test */}
        <div className="border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Нагрузочное тестирование (k6)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Проверьте производительность API под нагрузкой.
          </p>
          <Button size="sm" variant="outline">
            Запустить тест
          </Button>
        </div>

        {/* Results placeholder */}
        <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
          <p>Результаты тестов будут отображаться здесь</p>
        </div>
      </div>
    </div>
  );
}
