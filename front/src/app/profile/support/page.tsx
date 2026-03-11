"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, ChevronRight } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "Открыт", color: "bg-green-500" },
  in_progress: { label: "В работе", color: "bg-yellow-500" },
  closed: { label: "Закрыт", color: "bg-muted-foreground" },
};

interface Ticket {
  id: string;
  subject: string;
  status: string;
}

export default function SupportPage() {
  const [showForm, setShowForm] = useState(false);

  // TODO: connect to real API via TanStack Query
  const tickets: Ticket[] = [];

  return (
    <AppShell>
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Поддержка</h1>
              <p className="text-muted-foreground text-sm">
                Обращения в службу поддержки
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Новый тикет
            </Button>
          </div>

          {/* New ticket form */}
          {showForm && (
            <div className="border border-border rounded-xl p-6 mb-6 space-y-4">
              <input
                type="text"
                placeholder="Тема обращения"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Опишите вашу проблему..."
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                <Button size="sm">Отправить</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {/* Ticket list */}
          {tickets.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-12 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                У вас пока нет обращений
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket: Ticket) => {
                const st = STATUS_LABELS[ticket.status] || STATUS_LABELS.open;
                return (
                  <div
                    key={ticket.id}
                    className="border border-border rounded-lg p-4 flex items-center gap-3 hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${st.color} shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {st.label}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
