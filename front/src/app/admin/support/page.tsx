"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-500",
  in_progress: "bg-yellow-500",
  closed: "bg-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Открыт",
  in_progress: "В работе",
  closed: "Закрыт",
};

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
  user?: { email: string };
}

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-tickets", statusFilter],
    queryFn: () =>
      apiFetch<{ tickets: Ticket[]; total: number }>(
        `/admin/support/tickets?status=${statusFilter}`,
      ),
    staleTime: 10_000,
  });

  const tickets = data?.tickets || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Поддержка</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["", "open", "in_progress", "closed"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s ? STATUS_LABELS[s] : "Все"}
          </Button>
        ))}
      </div>

      {/* Tickets */}
      <div className="space-y-2">
        {tickets.map((t: Ticket) => (
          <div
            key={t.id}
            className="border border-border rounded-lg p-4 flex items-center gap-3 hover:bg-accent/50 cursor-pointer"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[t.status] || ""}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{t.subject}</p>
              <p className="text-xs text-muted-foreground">
                {t.user?.email} · {STATUS_LABELS[t.status] || t.status} ·{" "}
                {new Date(t.updatedAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">{t.priority}</span>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            Нет тикетов
          </div>
        )}
      </div>
    </div>
  );
}
